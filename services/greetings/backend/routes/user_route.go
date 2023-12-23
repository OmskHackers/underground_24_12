package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

type UserRouteController struct {
	userController controllers.UserController
}

func NewUserRouteController(userController controllers.UserController) UserRouteController {
	return UserRouteController{userController}
}

func (rc *UserRouteController) UserRoute(rg *gin.RouterGroup) {
	router := rg.Group("user")

	router.GET("/profile", rc.userController.GetUserBySession)
	router.POST("/greeting", rc.userController.CreateGreeting)
	router.GET("/greeting/description", rc.userController.GetGreetingDescriptionByID)
	router.GET("/greeting/file", rc.userController.GetGreetingFileByID)
}
