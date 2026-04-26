package router

import (
	"github.com/gin-gonic/gin"
)

func NewRouter(router *gin.RouterGroup) {
	apiRouter(router)
	difyXrsRouter(router)
}
