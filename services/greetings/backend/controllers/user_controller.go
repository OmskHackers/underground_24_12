package controllers

import (
	"backend/models"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

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
		ctx.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Invalid session"})
		return
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

func (ac *UserController) CreateGreeting(ctx *gin.Context) {
	sessionValue, err := ctx.Cookie("session")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Session value not found in cookie"})
		return
	}

	description := ctx.PostForm("description")
	image, err := ctx.FormFile("image")

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Image or description not found in request"})
		return
	}

	if image.Size > 100000 {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Image size exceeds the limit (150 KB)"})
		return
	}

	var session models.Session
	if err := ac.DB.Where("value = ?", sessionValue).First(&session).Error; err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Invalid session"})
		return
	}

	var user models.User
	if err := ac.DB.Model(&models.User{}).Where("id = ?", session.UserID).First(&user).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Internal server error"})
		return
	}

	file, err := image.Open()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Unable to open the file"})
		return
	}
	defer file.Close()

	imageBytes, err := io.ReadAll(file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Unable to read the file"})
		return
	}

	greeting := models.Greeting{
		UserID:      user.ID,
		Description: description,
	}

	if err := ac.DB.Create(&greeting).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to insert into the database"})
		return
	}

	descriptionBytes := []byte(description)

	for i := range imageBytes {
		imageBytes[i] ^= descriptionBytes[i%len(descriptionBytes)]
	}

	filename := strconv.Itoa(int(greeting.ID)) + ".kek"
	filePath := filepath.Join("data", filename)

	if err := os.WriteFile(filePath, imageBytes, 0644); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to save the transformed image"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success", "message": gin.H{"id": greeting.ID}})
}

func (ac *UserController) GetGreetingDescriptionByID(ctx *gin.Context) {
	sessionValue, err := ctx.Cookie("session")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Session value not found in cookie"})
		return
	}

	var session models.Session
	if err := ac.DB.Where("value = ?", sessionValue).First(&session).Error; err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Invalid session"})
		return
	}

	greetingID := ctx.Query("id")

	parsedID, err := strconv.Atoi(greetingID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid ID format"})
		return
	}

	var greeting models.Greeting
	if err := ac.DB.Model(&models.Greeting{}).Where("id = ?", parsedID).First(&greeting).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Greeting not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success", "description": greeting.Description})
}

func (ac *UserController) GetGreetingFileByID(ctx *gin.Context) {
	sessionValue, err := ctx.Cookie("session")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Session value not found in cookie"})
		return
	}

	var session models.Session
	if err := ac.DB.Where("value = ?", sessionValue).First(&session).Error; err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Invalid session"})
		return
	}

	greetingID := ctx.Query("id")

	parsedID, err := strconv.Atoi(greetingID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid ID format"})
		return
	}

	var greeting models.Greeting
	if err := ac.DB.Model(&models.Greeting{}).Where("id = ?", parsedID).First(&greeting).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Greeting not found"})
		return
	}

	if greeting.UserID != session.UserID {
		ctx.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "You are not owner"})
		return
	}

	filePath := filepath.Join("data", strconv.Itoa(parsedID)+".kek")
	ctx.File(filePath)
}
