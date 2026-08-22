package service
import ("y/internal/model"; "y/internal/repository")
type UserService interface { List() ([]model.User, error) }; type userService struct { repo repository.UserRepository }; func NewUserService(repo repository.UserRepository) UserService { return &userService{repo} }; func (s *userService) List() ([]model.User, error) { if s.repo == nil { return []model.User{}, nil }; return s.repo.List() }
