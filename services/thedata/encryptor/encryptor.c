#include "util/util.h"
#include "util/crypt_type.h"
#include "util/crypt.h"
#include "util/message.h"
#include "util/detect.h"
#include "util/entry.h"

#include <malloc.h>
#include <string.h>

#ifdef __cplusplus
extern "C" {
#endif

#define ENCRYPTED_ELEMENTS_COUNT 3
#define ERROR_SIZE 64
#define ENCRYPTED_SIZE 2048
#define DECRYPTED_SIZE 2048
#define KEY_SIZE 128

void init() {
    initRand();
}

int encrypt(Entry textEntry, char* outputBuffer, const long int outputBufferSize) {
    // [0:64] err [64:128] key [66:2048] [2048] \0
    // 
    printf("bufZise = %ld\n", outputBufferSize); // TODO: REMOVE
    printf("text = %s\n", textEntry.data); // TODO: REMOVE

    char error[ERROR_SIZE] = {};
    char encrypted[ENCRYPTED_SIZE] = {};
    char key[KEY_SIZE] = {};
    // char entries[20][256] = {};

    int type = randLength(1, MAX_CRYPT_TYPE + 1);

    Message* message = createMessage(type);

    Entry* messageEntry = (Entry*)malloc(sizeof(Entry));
    messageEntry->data = encrypted;
    messageEntry->length = 0;
    message->messageEntry = messageEntry;
    
    Entry* keyEntry = (Entry*)malloc(sizeof(Entry));
    keyEntry->data = key;
    keyEntry->length = 0;
    message->keyEntry = keyEntry;

    int precursorCount = randLength(3, 8);
    int postcursorCount = randLength(3, 8);

    int entryCount = precursorCount + 1 + postcursorCount;
    Entry** entries = (Entry**)calloc(entryCount, sizeof(Entry**));

    int i;
    for (i = 0; i < precursorCount; i++) {
        entries[i] = malloc(sizeof(Entry));
        int length = randLength(3, 8);
        char* data = malloc(length);
        generateString(data, length);
        data[0] = data[1];
        length = compressString(data, length);
        entries[i]->length = length;
        entries[i]->data = data;
    }

    entries[i] = malloc(sizeof(Entry));
    entries[i]->length = textEntry.length;
    entries[i]->data = malloc(textEntry.length);
    memcpy(entries[i++]->data, textEntry.data, textEntry.length);

    // char postcursor[8][8] = {};
    for (; i < entryCount; i++) {
        entries[i] = malloc(sizeof(Entry));
        int length = randLength(3, 8);
        char* data = malloc(length);
        generateString(data, length);
        data[0] = data[1];
        length = compressString(data, length);
        entries[i]->length = length;
        entries[i]->data = data;
    }

    message->entryCount = entryCount;
    message->entries = entries;

    message->controller->encode(message);

    Entry elements[] = {
        { error, strlen(error) },
        { message->messageEntry->data, message->messageEntry->length },
        { message->keyEntry->data, message->keyEntry->length }
    }; // TODO refactor to
    
    if (recollect(outputBuffer, outputBufferSize, elements, 3) != 0) { // TODO give &elements
        printf("Encrypting recollect error\n");
        for (i = 0; i < entryCount; i++) {
            free(entries[i]->data);
            free(entries[i]);
        }
        free(entries);
        free(keyEntry);
        free(messageEntry);
        deleteMessage(message);
        return -1;
    }

    //printf("encryCount = %d\n", entryCount);
    for (i = 0; i < entryCount; i++) {
        //printf("i = %d\n", i);
        free(entries[i]->data);
        free(entries[i]);
    }
    free(entries);
    free(keyEntry);
    free(messageEntry);
    deleteMessage(message);

    return 0;
};

int decrypt(Entry encryptedTextEntry, Entry keyEntry, char* outputBuffer, const long int outputBufferSize) {
    // [0:64] err [64:128] key [66:2048] [2048] \0
    // 
    char error[ERROR_SIZE] = {};
    char decrypted[DECRYPTED_SIZE] = {};
    char key[KEY_SIZE] = {};

    int type = detectType(encryptedTextEntry.data);

    Message* message = createMessage(type);

    Entry* messageEntry = (Entry*)malloc(sizeof(Entry));
    messageEntry->data = decrypted;
    messageEntry->length = 0;
    message->messageEntry = messageEntry;

    Entry* messageKeyEntry = (Entry*)malloc(sizeof(Entry)); // TODO add free()
    messageKeyEntry->data = keyEntry.data;
    messageKeyEntry->length = keyEntry.length;
    message->keyEntry = messageKeyEntry;
    //message->keyEntry = &keyEntry; // TODO test if it works and if it is change in encrypt
    

    int entryCount = 1;
    Entry** entries = (Entry**)calloc(entryCount, sizeof(Entry**));
    
    entries[0] = (Entry*)malloc(sizeof(Entry)); // TODO add free()
    entries[0]->data = encryptedTextEntry.data;
    entries[0]->length = encryptedTextEntry.length;
    //entries[0] = &encryptedTextEntry; // TODO test if it works and if it is change in encrypt

    message->entries = entries;

    if (message->controller->decode(message) != 0) {
        strcpy(error, "Wrong key");
    }

    Entry elements[] = {
        { error, strlen(error) },
        { message->messageEntry->data, message->messageEntry->length }
    };

    printf("in decr outsizebuf = %ld\n", outputBufferSize); 
    
    if (recollect(outputBuffer, outputBufferSize, elements, 2) != 0) {
        printf("Decrypting recollect error\n");
        free(entries);
        free(messageEntry);
        deleteMessage(message);
        return -1;
    }

    free(entries);
    free(messageEntry);
    deleteMessage(message);

    return 0;
};


int testFlask(Entry textEntry) {
    printf("Flask call, text = %s\n", textEntry.data);
}

#ifdef __cplusplus
}
#endif
