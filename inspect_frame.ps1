Add-Type -AssemblyName System.Drawing
$framePath = "c:\Users\mstar\OneDrive\Desktop\Showrav portfolio\public\facemovement\frame-080.webp"
$img = [System.Drawing.Image]::FromFile($framePath)
Write-Host "Frame-080 Size: $($img.Width) x $($img.Height)"
Write-Host "PixelFormat: $($img.PixelFormat)"
$bmp = New-Object System.Drawing.Bitmap($img)

# Sample various areas for alpha/white artifacts
$points = @(
    @(0, 0, "Top-left corner"),
    @(540, 0, "Top-center"),
    @(540, 50, "Hair top"),
    @(400, 150, "Hair edge left"),
    @(680, 150, "Hair edge right"),
    @(540, 200, "Face center"),
    @(270, 300, "Left shoulder edge"),
    @(810, 300, "Right shoulder edge"),
    @(540, 1150, "Belt area center"),
    @(450, 1150, "Belt area left"),
    @(630, 1150, "Belt area right"),
    @(300, 1350, "Watch area approx"),
    @(750, 1350, "Right hand area"),
    @(540, 1800, "Lower pants"),
    @(540, 1900, "Near bottom")
)

foreach ($pt in $points) {
    $x = $pt[0]
    $y = $pt[1]
    $label = $pt[2]
    if ($x -lt $bmp.Width -and $y -lt $bmp.Height) {
        $pixel = $bmp.GetPixel($x, $y)
        Write-Host "$label ($x,$y): R=$($pixel.R) G=$($pixel.G) B=$($pixel.B) A=$($pixel.A)"
    }
}

# Check semi-transparent edge pixels around hair region
Write-Host ""
Write-Host "=== Scanning hair edge for semi-transparent pixels ==="
$semiTransCount = 0
for ($x = 300; $x -le 780; $x += 10) {
    for ($y = 80; $y -le 250; $y += 10) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 0 -and $pixel.A -lt 255) {
            $semiTransCount++
            if ($semiTransCount -le 20) {
                Write-Host "Semi-transparent at ($x,$y): R=$($pixel.R) G=$($pixel.G) B=$($pixel.B) A=$($pixel.A)"
            }
        }
    }
}
Write-Host "Total semi-transparent pixels found in hair region: $semiTransCount"

# Check belt area for semi-transparent pixels
Write-Host ""
Write-Host "=== Scanning belt area for semi-transparent/white pixels ==="
$beltSemiTrans = 0
for ($x = 350; $x -le 730; $x += 5) {
    for ($y = 1100; $y -le 1230; $y += 5) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 0 -and $pixel.A -lt 255 -and $pixel.R -gt 200 -and $pixel.G -gt 200 -and $pixel.B -gt 200) {
            $beltSemiTrans++
            if ($beltSemiTrans -le 15) {
                Write-Host "White semi-transparent at ($x,$y): R=$($pixel.R) G=$($pixel.G) B=$($pixel.B) A=$($pixel.A)"
            }
        }
    }
}
Write-Host "White semi-transparent in belt area: $beltSemiTrans"

# Now compare with another frame to see if edges shift
$frame40Path = "c:\Users\mstar\OneDrive\Desktop\Showrav portfolio\public\facemovement\frame-040.webp"
$img40 = [System.Drawing.Image]::FromFile($frame40Path)
$bmp40 = New-Object System.Drawing.Bitmap($img40)
Write-Host ""
Write-Host "=== Frame 040 comparison ==="
Write-Host "Frame-040 Size: $($img40.Width) x $($img40.Height)"

# Same belt area pixel
$p80 = $bmp.GetPixel(540, 1150)
$p40 = $bmp40.GetPixel(540, 1150)
Write-Host "Belt center (540,1150) Frame 80: R=$($p80.R) G=$($p80.G) B=$($p80.B) A=$($p80.A)"
Write-Host "Belt center (540,1150) Frame 40: R=$($p40.R) G=$($p40.G) B=$($p40.B) A=$($p40.A)"

# Hair area
$h80 = $bmp.GetPixel(540, 120)
$h40 = $bmp40.GetPixel(540, 120)
Write-Host "Hair (540,120) Frame 80: R=$($h80.R) G=$($h80.G) B=$($h80.B) A=$($h80.A)"
Write-Host "Hair (540,120) Frame 40: R=$($h40.R) G=$($h40.G) B=$($h40.B) A=$($h40.A)"

$bmp.Dispose()
$img.Dispose()
$bmp40.Dispose()
$img40.Dispose()
