#include "encryptor.c"
#include "util/util.h"

#include <memory.h>
#include <stdio.h>

#ifdef __cplusplus
extern "C" {
#endif

int main() {
    char* text = "abcdefghjkuiyts";

    char* textBuf = malloc(strlen(text));
    strcpy(textBuf, text);

    int newLength = compressString(textBuf, strlen(textBuf));
    
    printf("%s\n", textBuf);

    free(textBuf);

    // const char* enc = "fR70mQDEBAJyZk4FAmJGbFoEAkBgQgMCOlQEAjBAYAICWBBBqRCO4lvePYS2KYp400Q5BgJQIiQoMAQCUCIkAgJgAgJMBQI4UCIkBQIoMEBgBQIuPFgy";
    // const char* key = "WgVT+gB7BmJGbFo=";
    // char buf2[2048];

    // decrypt(enc, key, buf2, 2048);

    


    return 0;
}



#ifdef __cplusplus
}
#endif
