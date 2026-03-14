import { Client as QuickStatClient } from '@quickstat/core'
import { Pm2Plugin } from '@quickstat/pm2'
import { PrometheusDataSource, ScrapeStrategy } from '@quickstat/prometheus'
import pm2 from 'pm2'
import http from 'http'

// Create QuickStat Client
const quickStatClient = new QuickStatClient({
  metrics: [],
  plugins: [
    // Register PM2 Plugin
    new Pm2Plugin({
      excludeMetrics: [],
      pm2,
    }),
  ],
  // Register the data source
  dataSource: new PrometheusDataSource({
    strategy: new ScrapeStrategy(),
  }),
})

// Let Prometheus scrape the metrics at http://localhost:3242
// WARNING: On production, properly secure the endpoint (if open)
http
  .createServer(async (req, res) => {
    const response = await quickStatClient.dataSource?.strategy?.getResponse()

    if (response) {
      res.writeHead(200, response.headers)
      res.end(response.file)
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Metrics not available')
    }
  })
  .listen(3242, "127.0.0.1")