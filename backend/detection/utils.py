def convert_to_tlwh(x1, y1, x2, y2, image_width, image_height):    
    # Convert to percentage format
    top_left_x = (x1 / image_width) * 100
    top_left_y = (y1 / image_height) * 100
    width = ((x2 - x1) / image_width) * 100
    height = ((y2 - y1) / image_height) * 100
    return top_left_x, top_left_y, width, height