package main

import (
	"backend/controllers"
	"backend/initializers"
	"backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var (
	server         *gin.Engine
	AuthController controllers.AuthController
	UserController controllers.UserController

	AuthRouteController routes.AuthRouteController
	UserRouteController routes.UserRouteController
)

func init() {
	initializers.ConnectDB()

	AuthController = controllers.NewAuthController(initializers.DB)
	AuthRouteController = routes.NewAuthRouteController(AuthController)

	UserController = controllers.NewUserController(initializers.DB)
	UserRouteController = routes.NewUserRouteController(UserController)

	server = gin.Default()
	server.Use(cors.Default())
}

func main() {
	router := server.Group("/api")
	AuthRouteController.AuthRoute(router)
	UserRouteController.UserRoute(router)
	server.Run(":8081")
}
