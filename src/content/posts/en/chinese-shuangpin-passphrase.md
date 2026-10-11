---
title: Chinese Shuangpin Passphrases
date: 2026-10-11
description: "English passphrases are hard to remember, right? Try Chinese ones."
draft: false
autoTranslated: true
tags: []
categories: []
series: []
license: ""
---

## Chinese Shuangpin Passphrases

So, how do you all generate your passwords?

Random passwords are hard to guess, sure, but they're also hard to remember.

Although I'd assume everyone is using a password manager by now, and has a YubiKey set up too...

What, you don't have a hardware key yet? Go get two. Yes, two. You need a backup, don't you? (lol)

But even so, there are always situations where we have to type a password by hand, and that's where the classic password manager comes in: your own brain (lol). That thing doesn't have unlimited storage, and memorizing something isn't as easy as clicking a save button.

So compared to purely random passwords, the relatively easy-to-remember option is a passphrase.

Most common password managers come with a passphrase generator, but while that's easy for native English speakers, for native Chinese speakers it's still hard to remember no matter how you slice it. It's basically just memorizing English vocabulary.

If you search around online, you can actually find existing tools that generate Chinese passphrases based on full pinyin. But what about shuangpin (double pinyin, where every syllable is typed with exactly two keys)?

I'm a Xiaohe Shuangpin user, and I've gotten really uncomfortable typing in full pinyin. Plus, a lot of words are quite long in full pinyin, whereas shuangpin keeps every word the same length, which is much more comfortable and gives typing a nice rhythm.

So I vibe-coded one. It's implemented purely on the frontend with no network access code whatsoever, and it's open source, so you can use it with peace of mind. You can download `index.html` and use it offline, or use it through the CLI (requires a Node environment).

[shuangpin-passphrase](https://github.com/panxiao81/shuangpin-passphrase)
