## 获取 IPv4 和 IPv6



自启动

```
cat /etc/systemd/system/getip.service
[Unit]
Description=ip - get
Documentation=https://caddyserver.com/docs/
After=network.target
Wants=network.target

[Service]
Type=simple
WorkingDirectory=/opt/soft/ip
ExecStart=/opt/soft/ip/ip
Restart=on-failure
RestartSec=5s
LimitNOFILE=1048576
LimitNPROC=500
AmbientCapabilities=CAP_NET_BIND_SERVICE
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes

[Install]
WantedBy=multi-user.target
```



配置 Nginx

```
# alisingv4.arick.top.conf
server {
    listen       80;
    server_name  alisingv4.arick.top;

    location / {
        proxy_pass http://127.0.0.1:7999; # 这里将v2ray的ws代理到本地的8080端口
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
    }
    # 全局跨域配置
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
}

server {
    listen       443 ssl;
    server_name  alisingv4.arick.top ;

    ssl_certificate /etc/nginx/ssl/arick.pem;
    ssl_certificate_key /etc/nginx/ssl/arick.key;

    # 全局跨域配置
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

    location / {
        proxy_pass http://127.0.0.1:7999; # 这里将v2ray的ws代理到本地的8080端口
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        #proxy_set_header Upgrade $http_upgrade;
        #proxy_set_header Connection "upgrade";
        #proxy_set_header Host $http_host;
        proxy_set_header Host $host;
    }
}

# alisingv6.arick.top.conf

server {
        #listen       80;
    listen [::]:80 ipv6only=on;
        server_name  alisingv6.arick.top;

    location / {
        proxy_pass http://[::1]:7999; # 这里将v2ray的ws代理到本地的8080端口
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        #proxy_set_header Upgrade $http_upgrade;
        #proxy_set_header Connection "upgrade";
        #proxy_set_header Host $host;

}
# 全局跨域配置
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
}

server {
        #listen       443 ssl;
    listen [::]:443 ssl ipv6only=on;
    server_name  alisingv6.arick.top;

    ssl_certificate /etc/nginx/ssl/arick.pem;
    ssl_certificate_key /etc/nginx/ssl/arick.key;

    # 全局跨域配置
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

    location / {
        proxy_pass http://[::1]:7999; # 这里将v2ray的ws代理到本地的8080端口
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        #proxy_set_header Host $host;
    }
}

# alisingip.arick.top.conf

server {
        listen       80;
    listen [::]:80;
        server_name  alisingip.arick.top;

    location / {
        proxy_pass http://[::1]:7999; # 这里将v2ray的ws代理到本地的8080端口
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        #proxy_set_header Upgrade $http_upgrade;
        #proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

server {
        listen       443 ssl;
    listen [::]:443 ssl;
    server_name  alisingip.arick.top;

    ssl_certificate /etc/nginx/ssl/arick.pem;
    ssl_certificate_key /etc/nginx/ssl/arick.key;

    location / {
        proxy_pass http://[::1]:7999; # 这里将v2ray的ws代理到本地的8080端口
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}
```

