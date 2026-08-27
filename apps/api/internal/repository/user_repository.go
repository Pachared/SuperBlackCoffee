package repository

import "y/internal/model"

type UserRepository interface{ List() ([]model.User, error) }
