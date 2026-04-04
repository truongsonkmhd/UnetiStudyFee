# ========= Stage 0: lấy docker CLI =========
FROM docker:27-cli AS dockercli

# ========= Stage 1: build jar =========
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

RUN chmod +x mvnw \
  && sed -i 's/\r$//' mvnw \
  && ./mvnw -q -DskipTests dependency:go-offline \
  && ./mvnw -q -DskipTests package

# ========= Stage 2: runtime =========
FROM eclipse-temurin:17-jre
WORKDIR /app

# copy docker cli vào runtime image
COPY --from=dockercli /usr/local/bin/docker /usr/local/bin/docker

# (khuyến nghị) có CA cert để gọi HTTPS, và tzdata nếu bạn log giờ VN
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates tzdata \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8097 5005

# Bật remote debug port 5005
# suspend=n: app chạy luôn;  đổi y nếu muốn app chờ IDE attach rồi mới chạy
ENTRYPOINT ["java","-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005","-jar","app.jar"]
