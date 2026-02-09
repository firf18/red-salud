# PowerShell profile addition for pnpm
# Add this to your PowerShell profile (Run: $PROFILE to find the location)

# Function to run pnpm with proper path
function pnpm {
    & "C:\Users\Fredd\AppData\Roaming\npm\pnpm.cmd" @args
}

# Also create an alias for convenience
Set-Alias -Name pn -Value pnpm -Scope Global
