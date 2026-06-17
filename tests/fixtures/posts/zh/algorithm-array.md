---
title: "算法与数据结构 -- 线性表（2）-- 顺序表"
date: 2024-03-11
description: "上一节我们介绍了线性表的概念，这一节阐述线性表的顺序存储实现。"
draft: false
autoTranslated: false
tags:
  - programming
  - algorithm
  - data-structure
  - journal
categories:
  - Algorithm
series:
  - "408"
  - Algorithm
---

上一节我们介绍了线性表的概念，这一节阐述线性表的顺序存储实现。

## 顺序表

顺序表的元素在内存中连续存储，访问的时间复杂度是 $O(1)$。

### 初始化

初始化顺序表时，分配一段连续的空间即可。

### 删除

删除第 $i$ 个元素后，其后的元素整体前移一位。
