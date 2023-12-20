package controllers

import (
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserController struct {
	DB *gorm.DB
}

func NewUserController(DB *gorm.DB) UserController {
	return UserController{DB}
}

func (ac *UserController) GetUserBySession(ctx *gin.Context) {
	sessionValue, err := ctx.Cookie("session")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Session value not found in cookie"})
		return
	}

	var session models.Session
	if err := ac.DB.Where("value = ?", sessionValue).First(&session).Error; err != nil {
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Invalid session"})
			return
		}
	}

	var user models.User
	if err := ac.DB.Model(&models.User{}).Where("id = ?", session.UserID).First(&user).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Internal server error"})
		return
	}

	authResponse := &models.AuthResponse{
		Username:     user.Username,
		SessionValue: session.Value,
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success", "message": gin.H{"user": authResponse}})
}
