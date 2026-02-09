#!/usr/bin/env pwsh
# pnpm.ps1 - PowerShell wrapper for pnpm
# This allows you to use 'pnpm' commands directly without 'npx'

# Pass all arguments to npx pnpm
& npx pnpm @args
