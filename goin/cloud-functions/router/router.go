package router

import (
	"github.com/gin-gonic/gin"
)

func NewRouter(router *gin.Engine) *gin.RouterGroup {
	apiRouter(router)
	return difyXrsRouter(router)
}
