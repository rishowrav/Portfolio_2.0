Add-Type -AssemblyName System.Drawing
$framePath = Join-Path $PSScriptRoot "public\facemovement\frame-080.webp"
$img = [System.Drawing.Image]::FromFile($framePath)
Write-Host "Size: $($img.Width) x $($img.Height) Format: $($img.PixelFormat)"
$bmp = New-Object System.Drawing.Bitmap($img)

# Key edge points
$tests = @(
    @(0,0), @(540,0), @(540,50), @(400,150), @(680,150), @(540,200),
    @(540,1100), @(540,1150), @(540,1200), @(450,1150), @(630,1150),
    @(300,1350), @(750,1350)
)
foreach ($pt in $tests) {
    $px = $bmp.GetPixel($pt[0], $pt[1])
    Write-Host "($($pt[0]),$($pt[1])): R=$($px.R) G=$($px.G) B=$($px.B) A=$($px.A)"
}

# Count semi-transparent pixels in the hair area (the white halo source)
$count = 0
for ($x = 300; $x -lt 780; $x += 20) {
    for ($y = 50; $y -lt 250; $y += 10) {
        $px = $bmp.GetPixel($x, $y)
        if ($px.A -gt 0 -and $px.A -lt 200) {
            $count++
            if ($count -le 10) { Write-Host "SemiTrans hair ($x,$y): R=$($px.R) G=$($px.G) B=$($px.B) A=$($px.A)" }
        }
    }
}
Write-Host "Semi-transparent pixels in hair region: $count"

$bmp.Dispose()
$img.Dispose()
