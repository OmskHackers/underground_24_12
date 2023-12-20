package models

import "github.com/google/uuid"

type AuthRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Username     string    `json:"username,omitempty"`
	SessionValue uuid.UUID `json:"session_value,omitempty"`
}
