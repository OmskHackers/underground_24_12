#include "detect.h"
#include "string.h"

int detectType(const char* message) {
    {
        // detecting 1
        char mg[4];
        int ind = 0;
        unsigned char key = *(message+ind++);
        unsigned char step = *(message+ind++);
        for (int i = 0; i < 4; i++) {
            mg[i] = (*(message+ind++)) ^ key;
            key += step;
        }
        printf("magic = %s\n\n", mg);
        if (!strcmp(mg, "MNL1")) {
            return 1;
        }
    }
    
    return -1;
}