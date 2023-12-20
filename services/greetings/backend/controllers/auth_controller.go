package controllers

import (
	"backend/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthController struct {
	DB *gorm.DB
}

func NewAuthController(DB *gorm.DB) AuthController {
	return AuthController{DB}
}

func (ac *AuthController) Register(ctx *gin.Context) {
	var payload *models.AuthRequest

	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": err.Error()})
		return
	}

	if len(payload.Username) > 100 || len(payload.Password) > 100 {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Username or password length exceeds the maximum limit of 100 characters"})
		return
	}

	newUser := models.User{
		Username: payload.Username,
		Password: payload.Password,
	}

	result := ac.DB.Create(&newUser)

	if result.Error != nil && strings.Contains(result.Error.Error(), "duplicate key value violates unique") {
		ctx.JSON(http.StatusConflict, gin.H{"status": "fail", "message": "User with that username already exists"})
		return
	}

	sessionValue := uuid.New()

	newSession := models.Session{
		Value:  sessionValue,
		UserID: newUser.ID,
	}

	ac.DB.Create(&newSession)

	authResponse := &models.AuthResponse{
		Username:     newUser.Username,
		SessionValue: sessionValue,
	}

	ctx.JSON(http.StatusCreated, gin.H{"status": "success", "message": gin.H{"user": authResponse}})
}

func (ac *AuthController) Login(ctx *gin.Context) {
	var payload *models.AuthRequest

	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": err.Error()})
		return
	}

	var user models.User
	result := ac.DB.Where("username = ?", payload.Username).First(&user)
	if result.Error != nil || user.Password != payload.Password {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Incorrect username or password"})
		return
	}

	var session models.Session
	if err := ac.DB.Where("user_id = ?", user.ID).First(&session).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "fail", "message": "Failed to retrieve session"})
		return
	}

	authResponse := &models.AuthResponse{
		Username:     user.Username,
		SessionValue: session.Value,
	}

	ctx.JSON(http.StatusCreated, gin.H{"status": "success", "message": gin.H{"user": authResponse}})
}
