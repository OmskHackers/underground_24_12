#include "message.h"
#include "util.h"
#include "detect.h"

#include <string.h>

#include <stdio.h>

#ifdef __cplusplus
extern "C" {
#endif

static unsigned char ec1(unsigned char c, unsigned char k) {
    return c ^ k;
}

typedef struct {
    unsigned char key;
    unsigned char step;
} crypt_params;

static const crypt_params
mc1_crypt_params[] = {
    {  0x1b, 0x37 },
    {  0x51, 0xe9 },
    {  0xc1, 0x51 },
    {  0x03, 0x19 },
    {  0xab, 0xcd },
    {  0x12, 0x34 },
    {  0x35, 0x97 },
    {  0x99, 0x37 },
};

static int mc1_encrypt(Message* message) {
    unsigned char k = randLength(MIN_CHAR, MAX_CHAR);
    unsigned char s = randLength(1, MIN_CHAR);
    unsigned char kk = randLength(MIN_CHAR, MAX_CHAR);
    unsigned char ks = randLength(1, MIN_CHAR);

    message->messageEntry->data[message->messageEntry->length++] = k;
    message->messageEntry->data[message->messageEntry->length++] = s;
    message->keyEntry->data[message->keyEntry->length++] = kk;
    message->keyEntry->data[message->keyEntry->length++] = ks;
    kk *= k;
    ks *= s;
    k -= s;
    kk -= ks;
    message->messageEntry->data[4] = ec1(76, k + s * 3); // 'L'
    message->keyEntry->data[4] = ec1(76, kk + ks * 3);
    message->messageEntry->data[message->messageEntry->length++] = ec1(77, k += s); // 'M'
    message->keyEntry->data[message->keyEntry->length++] = ec1(77, kk += ks);
    message->messageEntry->data[message->messageEntry->length++] = ec1(78, k += s); k += s; message->messageEntry->length++; // 'N'
    message->keyEntry->data[message->keyEntry->length++] = ec1(78, kk += ks); kk += ks; message->keyEntry->length++;
    message->messageEntry->data[message->messageEntry->length++] = ec1('1', k += s);
    message->keyEntry->data[message->keyEntry->length++] = ec1('1', kk += ks); 

    for (int i = 0; i < message->entryCount; i++) {
        Entry* entry = message->entries[i];
        message->messageEntry->data[message->messageEntry->length++] = (char)entry->length; // TODO add k|kk xor
        unsigned char cryptKey = mc1_crypt_params[i%8].key;
        unsigned char cryptStep = mc1_crypt_params[i%8].step;
        if (entry->data[0] >= 32) {
            message->keyEntry->data[message->keyEntry->length++] = (char)i; // special
        }
        for (int j = 0; j < entry->length; j++) {
            message->messageEntry->data[message->messageEntry->length++] = entry->data[j] ^ cryptKey;
            cryptKey += cryptStep;
        }
    }

    int addKeyLength = randLength(3, 8);
    generateString(message->keyEntry->data + message->keyEntry->length, addKeyLength);
    message->keyEntry->length += addKeyLength;    

    return 0;
}

static int mc1_decrypt(Message* message) {
    // entries[0] is encrypted message, entriesCount = length of entries[0]

    // TODO add safety on Length

    Entry* encryptedEntry = message->entries[0];
    int encryptedInd = 0;
    int keyInd = 0;

    message->keyEntry->data[keyInd] = encryptedEntry->data[encryptedInd++] * message->keyEntry->data[keyInd]; keyInd++;
    message->keyEntry->data[keyInd] = encryptedEntry->data[encryptedInd++] * message->keyEntry->data[keyInd]; keyInd++;

    if (detectType(message->keyEntry->data) != 1)
        return -1;
    keyInd += 4;
    encryptedInd += 4;
    
    int spec = message->keyEntry->data[keyInd++];

    for (int i = 0; i < spec; i++) {
        // TODO add k|kk xor
        unsigned char length = encryptedEntry->data[encryptedInd++];
        encryptedInd += length;
    }
    
    
    message->messageEntry->length = 0;
    int length = encryptedEntry->data[encryptedInd++];
    
    unsigned char cryptKey = mc1_crypt_params[spec%8].key;
    unsigned char cryptStep = mc1_crypt_params[spec%8].step;
    for (int i = 0; i < length; i++) {
        message->messageEntry->data[message->messageEntry->length++] = encryptedEntry->data[encryptedInd++] ^ cryptKey;
        cryptKey += cryptStep;
    }

    return 0;
}


const MessageController messageController1 = {
    mc1_encrypt,
    mc1_decrypt
};

#ifdef __cplusplus
}
#endif
