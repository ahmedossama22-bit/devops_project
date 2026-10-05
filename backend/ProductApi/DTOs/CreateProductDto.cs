using System.ComponentModel.DataAnnotations;

namespace ProductApi.DTOs;

public class CreateProductDto
{
    [Required(ErrorMessage = "Product name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, 100000.00, ErrorMessage = "Price must be greater than zero")]
    public decimal Price { get; set; }

    [Required(ErrorMessage = "Category is required")]
    [MaxLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string Category { get; set; } = string.Empty;

    public bool IsAvailable { get; set; } = true;
}
