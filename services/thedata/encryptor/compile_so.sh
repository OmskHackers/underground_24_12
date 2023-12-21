#!/bin/bash

gcc -fdiagnostics-color=always -fopenmp -shared -o encryptor.so -fPIC util/*.c encryptor.c
