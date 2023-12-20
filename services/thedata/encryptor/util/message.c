#include "message.h"
#include <stdlib.h>


extern const MessageController messageController1;
// extern const MessageController controller2;
// extern const MessageController controller5;
// extern const MessageController controller7;

static const MessageController* messageTypeToController(unsigned int type) {
    switch (type) {
    case 1:
    case 2:
        return &messageController1;
    case 3:
        //return &controller2;
    }

    return NULL;
}

Message* createMessage(unsigned int messageType) {
    Message* message = malloc(sizeof(Message));
    message->messageType = messageType;
    message->controller = messageTypeToController(messageType);
    return message;
}

void deleteMessage(Message* message) {
    free(message);
}
