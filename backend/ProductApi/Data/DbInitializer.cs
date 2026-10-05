using Microsoft.EntityFrameworkCore;
using ProductApi.Models;

namespace ProductApi.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider, ILogger logger)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        int maxRetries = 10;
        int delaySeconds = 3;

        for (int retry = 1; retry <= maxRetries; retry++)
        {
            try
            {
                logger.LogInformation("Attempting to connect to SQL Server and initialize database (Attempt {Retry}/{MaxRetries})...", retry, maxRetries);
                
                await context.Database.EnsureCreatedAsync();
                
                logger.LogInformation("Database connection successful and schema verified.");

                if (!await context.Products.AnyAsync())
                {
                    logger.LogInformation("Seeding initial products data...");
                    
                    var seedProducts = new List<Product>
                    {
                        new()
                        {
                            Name = "Cloud Developer Laptop",
                            Description = "High-performance workstation with 32GB RAM and 1TB NVMe SSD",
                            Price = 1499.99m,
                            Category = "Hardware",
                            IsAvailable = true,
                            CreatedAt = DateTime.UtcNow
                        },
                        new()
                        {
                            Name = "Mechanical Keyboard",
                            Description = "RGB backlit wireless mechanical keyboard with tactile switches",
                            Price = 129.50m,
                            Category = "Accessories",
                            IsAvailable = true,
                            CreatedAt = DateTime.UtcNow
                        },
                        new()
                        {
                            Name = "UltraWide 4K Monitor",
                            Description = "34-inch curved IPS monitor with USB-C 90W power delivery",
                            Price = 599.00m,
                            Category = "Monitors",
                            IsAvailable = true,
                            CreatedAt = DateTime.UtcNow
                        },
                        new()
                        {
                            Name = "Ergonomic Desk Chair",
                            Description = "Adjustable lumbar support and breathable mesh seating",
                            Price = 349.95m,
                            Category = "Furniture",
                            IsAvailable = false,
                            CreatedAt = DateTime.UtcNow
                        },
                        new()
                        {
                            Name = "Docker & Kubernetes Handbook",
                            Description = "Comprehensive guide to microservices, DevOps pipelines, and orchestration",
                            Price = 45.00m,
                            Category = "Books",
                            IsAvailable = true,
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    await context.Products.AddRangeAsync(seedProducts);
                    await context.SaveChangesAsync();

                    logger.LogInformation("Successfully seeded {Count} products.", seedProducts.Count);
                }

                return;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to connect or initialize database. Retrying in {Delay}s... (Attempt {Retry}/{MaxRetries})", delaySeconds, retry, maxRetries);
                if (retry == maxRetries)
                {
                    logger.LogError(ex, "Could not initialize database after {MaxRetries} attempts.", maxRetries);
                    throw;
                }
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
            }
        }
    }
}
