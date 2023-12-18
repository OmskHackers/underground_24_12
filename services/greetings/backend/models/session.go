package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Session struct {
	gorm.Model
	ID     int64     `gorm:"autoIncrement;uniqueIndex;not null"`
	Value  uuid.UUID `gorm:"type:uuid;uniqueIndex;not null"`
	UserID int64     `gorm:"foreignKey:UserID"`
}
