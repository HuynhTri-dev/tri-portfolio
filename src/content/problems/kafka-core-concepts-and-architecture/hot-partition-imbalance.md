---
title: "Hiện tượng Hot Partition (Lệch tải đĩa và CPU) do chọn sai Partition Key"
parentSlug: "kafka-core-concepts-and-architecture"
errorCode: "ERR_HOT_PARTITION_IMBALANCE"
environment: "Apache Kafka 3.x / 4.x / Redpanda, Multi-tenant Architecture"
tags:
  - kafka
  - hot-partition
  - partition-key
  - hashing
  - scalability
date: "2026-10-10T22:00:00.000Z"
---

## Error Symptoms
```
Broker alert: Partition 2 disk usage is 94% (850GB) while Partitions 0, 1, 3 are at 12% (110GB). Consumer assigned to Partition 2 lag exceeds 45,000 records.
```

## Root Cause
Chọn `tenant_id` làm Partition Key đơn thuần. Trong môi trường Multi-tenant, khách hàng VIP chiếm 80% lưu lượng, khiến mọi sự kiện dồn hết vào Partition 2. Các partition còn lại hầu như nhàn rỗi.

## Verified Solution
Áp dụng Composite Key hoặc Key Salting: Kết hợp `tenant_id` với entity UUID: `f'{tenant_id}:{linkedid}'`. Vì `linkedid` có tính ngẫu nhiên cao, thuật toán băm Murmur2 rải đều tải khắp toàn bộ các Partition trong khi vẫn đảm bảo chuỗi sự kiện của từng phiên gọi duy nhất luôn nằm trên cùng 1 partition.
