using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

public static class ProcessGeneratedSprite
{
    private struct Box
    {
        public int X;
        public int Y;
        public int W;
        public int H;
        public bool Empty;
    }

    public static int Main(string[] args)
    {
        if (args.Length != 5)
        {
            Console.Error.WriteLine("Usage: ProcessGeneratedSprite <input.png> <rows> <cols> <out-dir> <name>");
            return 2;
        }

        string input = args[0];
        int rows = int.Parse(args[1]);
        int cols = int.Parse(args[2]);
        string outDir = args[3];
        string name = args[4];

        Directory.CreateDirectory(outDir);
        Directory.CreateDirectory(Path.Combine(outDir, "frames"));
        File.Copy(input, Path.Combine(outDir, "raw-sheet.png"), true);

        using (var raw = new Bitmap(input))
        {
            int cellW = raw.Width / cols;
            int cellH = raw.Height / rows;
            var crops = new List<Bitmap>();
            var boxes = new List<Box>();
            int maxW = 1;
            int maxH = 1;

            for (int r = 0; r < rows; r++)
            {
                for (int c = 0; c < cols; c++)
                {
                    var rect = new Rectangle(c * cellW, r * cellH, cellW, cellH);
                    var transparentCell = KeepLargestComponent(TransparentCrop(raw, rect));
                    Box box = FindContentBox(transparentCell);
                    boxes.Add(box);
                    crops.Add(transparentCell);
                    if (!box.Empty)
                    {
                        maxW = Math.Max(maxW, box.W);
                        maxH = Math.Max(maxH, box.H);
                    }
                }
            }

            const int outCell = 128;
            const int safe = 112;
            float scale = Math.Min((float)safe / maxW, (float)safe / maxH);
            scale = Math.Min(scale, 1.0f);

            using (var sheet = NewTransparentBitmap(cols * outCell, rows * outCell))
            using (var sheetGraphics = Graphics.FromImage(sheet))
            using (var strip = NewTransparentBitmap(crops.Count * outCell, outCell))
            using (var stripGraphics = Graphics.FromImage(strip))
            {
                sheetGraphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.NearestNeighbor;
                sheetGraphics.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.Half;
                stripGraphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.NearestNeighbor;
                stripGraphics.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.Half;

                for (int i = 0; i < crops.Count; i++)
                {
                    Box box = boxes[i];
                    using (var frame = NewTransparentBitmap(outCell, outCell))
                    using (var g = Graphics.FromImage(frame))
                    {
                        g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.NearestNeighbor;
                        g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.Half;

                        if (!box.Empty)
                        {
                            int drawW = Math.Max(1, (int)Math.Round(box.W * scale));
                            int drawH = Math.Max(1, (int)Math.Round(box.H * scale));
                            int x = (outCell - drawW) / 2;
                            int footY = 116;
                            int y = footY - drawH;
                            var src = new Rectangle(box.X, box.Y, box.W, box.H);
                            var dst = new Rectangle(x, y, drawW, drawH);
                            g.DrawImage(crops[i], dst, src, GraphicsUnit.Pixel);
                        }

                        string frameName = Path.Combine(outDir, "frames", string.Format("{0}_{1:D2}.png", name, i + 1));
                        frame.Save(frameName, ImageFormat.Png);

                        int row = i / cols;
                        int col = i % cols;
                        sheetGraphics.DrawImage(frame, col * outCell, row * outCell, outCell, outCell);
                        stripGraphics.DrawImage(frame, i * outCell, 0, outCell, outCell);
                    }
                }

                sheet.Save(Path.Combine(outDir, "sheet-transparent.png"), ImageFormat.Png);
                strip.Save(Path.Combine(outDir, name + "-strip-transparent.png"), ImageFormat.Png);
            }

            using (var clean = NewTransparentBitmap(raw.Width, raw.Height))
            using (var g = Graphics.FromImage(clean))
            {
                g.DrawImage(MakeTransparent(raw), 0, 0);
                clean.Save(Path.Combine(outDir, "raw-sheet-clean.png"), ImageFormat.Png);
            }

            WriteMeta(outDir, name, input, rows, cols, cellW, cellH, boxes, maxW, maxH, scale);

            foreach (var crop in crops)
            {
                crop.Dispose();
            }
        }

        return 0;
    }

    private static Bitmap TransparentCrop(Bitmap source, Rectangle rect)
    {
        var output = NewTransparentBitmap(rect.Width, rect.Height);
        for (int y = 0; y < rect.Height; y++)
        {
            for (int x = 0; x < rect.Width; x++)
            {
                Color p = source.GetPixel(rect.X + x, rect.Y + y);
                output.SetPixel(x, y, IsMagentaBackground(p) ? Color.Transparent : Color.FromArgb(p.A, p.R, p.G, p.B));
            }
        }
        return output;
    }

    private static Bitmap MakeTransparent(Bitmap source)
    {
        var output = NewTransparentBitmap(source.Width, source.Height);
        for (int y = 0; y < source.Height; y++)
        {
            for (int x = 0; x < source.Width; x++)
            {
                Color p = source.GetPixel(x, y);
                output.SetPixel(x, y, IsMagentaBackground(p) ? Color.Transparent : Color.FromArgb(p.A, p.R, p.G, p.B));
            }
        }
        return output;
    }

    private static bool IsMagentaBackground(Color p)
    {
        return p.R >= 220 && p.G <= 80 && p.B >= 220;
    }

    private static Box FindContentBox(Bitmap image)
    {
        int minX = image.Width;
        int minY = image.Height;
        int maxX = -1;
        int maxY = -1;
        for (int y = 0; y < image.Height; y++)
        {
            for (int x = 0; x < image.Width; x++)
            {
                if (image.GetPixel(x, y).A == 0)
                {
                    continue;
                }
                minX = Math.Min(minX, x);
                minY = Math.Min(minY, y);
                maxX = Math.Max(maxX, x);
                maxY = Math.Max(maxY, y);
            }
        }

        if (maxX < minX || maxY < minY)
        {
            return new Box { Empty = true };
        }

        return new Box { X = minX, Y = minY, W = maxX - minX + 1, H = maxY - minY + 1, Empty = false };
    }

    private static Bitmap KeepLargestComponent(Bitmap input)
    {
        int width = input.Width;
        int height = input.Height;
        var visited = new bool[width, height];
        var best = new List<Point>();
        int[] dx = { 1, -1, 0, 0 };
        int[] dy = { 0, 0, 1, -1 };

        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                if (visited[x, y] || input.GetPixel(x, y).A == 0)
                {
                    continue;
                }

                var component = new List<Point>();
                var queue = new Queue<Point>();
                visited[x, y] = true;
                queue.Enqueue(new Point(x, y));

                while (queue.Count > 0)
                {
                    Point p = queue.Dequeue();
                    component.Add(p);
                    for (int i = 0; i < 4; i++)
                    {
                        int nx = p.X + dx[i];
                        int ny = p.Y + dy[i];
                        if (nx < 0 || ny < 0 || nx >= width || ny >= height || visited[nx, ny])
                        {
                            continue;
                        }
                        visited[nx, ny] = true;
                        if (input.GetPixel(nx, ny).A != 0)
                        {
                            queue.Enqueue(new Point(nx, ny));
                        }
                    }
                }

                if (component.Count > best.Count)
                {
                    best = component;
                }
            }
        }

        var output = NewTransparentBitmap(width, height);
        foreach (Point p in best)
        {
            output.SetPixel(p.X, p.Y, input.GetPixel(p.X, p.Y));
        }
        input.Dispose();
        return output;
    }

    private static Bitmap NewTransparentBitmap(int width, int height)
    {
        var bmp = new Bitmap(width, height, PixelFormat.Format32bppArgb);
        using (var g = Graphics.FromImage(bmp))
        {
            g.Clear(Color.Transparent);
        }
        return bmp;
    }

    private static void WriteMeta(string outDir, string name, string input, int rows, int cols, int cellW, int cellH, List<Box> boxes, int maxW, int maxH, float scale)
    {
        using (var writer = new StreamWriter(Path.Combine(outDir, "pipeline-meta.json"), false))
        {
            writer.WriteLine("{");
            writer.WriteLine("  \"name\": \"" + Escape(name) + "\",");
            writer.WriteLine("  \"source\": \"" + Escape(input) + "\",");
            writer.WriteLine("  \"rows\": " + rows + ",");
            writer.WriteLine("  \"cols\": " + cols + ",");
            writer.WriteLine("  \"sourceCellWidth\": " + cellW + ",");
            writer.WriteLine("  \"sourceCellHeight\": " + cellH + ",");
            writer.WriteLine("  \"outputCellSize\": 128,");
            writer.WriteLine("  \"anchor\": \"feet\",");
            writer.WriteLine("  \"sharedScale\": " + scale.ToString(System.Globalization.CultureInfo.InvariantCulture) + ",");
            writer.WriteLine("  \"maxContentWidth\": " + maxW + ",");
            writer.WriteLine("  \"maxContentHeight\": " + maxH + ",");
            writer.WriteLine("  \"frames\": [");
            for (int i = 0; i < boxes.Count; i++)
            {
                Box b = boxes[i];
                writer.Write("    { \"index\": " + (i + 1) + ", \"x\": " + b.X + ", \"y\": " + b.Y + ", \"w\": " + b.W + ", \"h\": " + b.H + " }");
                writer.WriteLine(i == boxes.Count - 1 ? "" : ",");
            }
            writer.WriteLine("  ]");
            writer.WriteLine("}");
        }
    }

    private static string Escape(string value)
    {
        return value.Replace("\\", "\\\\").Replace("\"", "\\\"");
    }
}
