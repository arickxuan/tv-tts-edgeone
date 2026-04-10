package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

type Config struct {
	Port int    `json:"port"`
	Host string `json:"host"`
}

func main() {
	// 加载配置
	config, err := loadConfig("config.json")
	if err != nil {
		fmt.Printf("加载配置失败: %v\n", err)
		os.Exit(1)
	}

	// 注册路由（具体路径须先于 "/" 的静态文件服务注册）
	http.HandleFunc("/ip", getVisitorIP)
	http.HandleFunc("/ping", getPong)
	http.HandleFunc("/api/ipinfo", proxyIPWho)
	publicDir := http.FileServer(http.Dir("public"))
	http.Handle("/", publicDir)

	// 启动服务
	addr := fmt.Sprintf("%s:%d", config.Host, config.Port)
	fmt.Printf("Server is running on http://%s\n", addr)
	fmt.Printf("IPv4: http://0.0.0.0:%d\n", config.Port)
	fmt.Printf("IPv6: http://[::]:%d\n", config.Port)
	
	if err := http.ListenAndServe(addr, withCORS(http.DefaultServeMux)); err != nil {
		fmt.Printf("启动服务失败: %v\n", err)
	}
}

// withCORS 为所有响应加上跨域头，允许任意来源（*）。
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func loadConfig(filename string) (*Config, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	config := &Config{}
	err = decoder.Decode(config)
	return config, err
}

func getVisitorIP(w http.ResponseWriter, r *http.Request) {
	ip := getRealIP(r)
	ipv4, ipv6 := splitIP(ip)
	fip,ips := getForwardedIP(r)
	fipv4, fipv6 := splitIP(fip)
	host := getHostIP(r)

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"ip": "%s", "ipv4": "%s", "ipv6": "%s", "Forwarde ipv4": "%s", "Forwarde ipv6": "%s", "Forwarde ips": "%s", "host": "%s"}`, ip, ipv4, ipv6, fipv4, fipv6,ips,host)
}

func getPong(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"code": 0, "msg": "%s", "data": "%s"}`, "ok", "")
}

// proxyIPWho 服务端请求 ipwho.is，避免浏览器直连第三方时的 CORS 限制。
func proxyIPWho(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "method not allowed"})
		return
	}
	ipStr := strings.TrimSpace(r.URL.Query().Get("ip"))
	if net.ParseIP(ipStr) == nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid ip"})
		return
	}
	target := "https://ipwho.is/" + url.PathEscape(ipStr)
	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Get(target)
	if err != nil {
		w.WriteHeader(http.StatusBadGateway)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "upstream: " + err.Error()})
		return
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		w.WriteHeader(http.StatusBadGateway)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "read upstream: " + err.Error()})
		return
	}
	if resp.StatusCode != http.StatusOK {
		w.WriteHeader(http.StatusBadGateway)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "upstream status " + resp.Status})
		return
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(body)
}

func getForwardedIP(r *http.Request) (string,string){
	// 检查 X-Forwarded-For
	xForwardedFor := r.Header.Get("X-Forwarded-For")
	if xForwardedFor != "" {
		ips := strings.Split(xForwardedFor, ",")
		fmt.Println(ips)
		rawIP := strings.TrimSpace(ips[0])
		if net.ParseIP(rawIP) != nil {
			return rawIP,xForwardedFor
		}
	}
	return "",""
}

func getRealIP(r *http.Request) string {

	// 检查 X-Real-IP
	xRealIP := r.Header.Get("X-Real-IP")
	if xRealIP != "" {
		if net.ParseIP(xRealIP) != nil {
			return xRealIP
		}
	}

	return ""

}

func getHostIP(r *http.Request) string {
	// 从 RemoteAddr 获取
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func splitIP(ipStr string) (ipv4, ipv6 string) {
	ip := net.ParseIP(ipStr)
	if ip == nil {
		return "", ""
	}

	if ip.To4() != nil {
		return ipStr, ""
	}

	if ip.To16() != nil {
		return "", ipStr
	}

	return "", ""
}
