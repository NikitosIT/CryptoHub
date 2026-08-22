import { APP_ROUTES } from "@/constants/routes.js";
import { logger } from "@/libs/logger.js";

type StartupSummaryOptions = {
  port: number;
};

const DEV_INFRA_URLS = {
  grafana: "http://localhost:3001",
  prometheus: "http://localhost:9090",
  pgAdmin: "http://localhost:5050",
  redisInsight: "http://localhost:5540",
} as const;

export const logStartupSummary = ({ port }: StartupSummaryOptions): void => {
  const appBaseUrl = `http://localhost:${port}`;

  logger.info(
    [
      `Server running on ${appBaseUrl}`,
      `OpenAPI: ${appBaseUrl}${APP_ROUTES.docs}`,
      `Health: ${appBaseUrl}${APP_ROUTES.health}`,
      `Metrics: ${appBaseUrl}${APP_ROUTES.metrics}`,
      `Bull Board: ${appBaseUrl}${APP_ROUTES.adminQueues}`,
      "",
      `Grafana: ${DEV_INFRA_URLS.grafana}`,
      `Prometheus: ${DEV_INFRA_URLS.prometheus}`,
      `PgAdmin: ${DEV_INFRA_URLS.pgAdmin}`,
      `RedisInsight: ${DEV_INFRA_URLS.redisInsight}`,
    ].join("\n"),
  );
};
