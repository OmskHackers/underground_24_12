package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Session struct {
	gorm.Model
	Value  uuid.UUID `gorm:"type:uuid;uniqueIndex;not null"`
	UserID uint      `gorm:"uniqueIndex;not null"`
}
