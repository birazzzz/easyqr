// Show the UI with initial size
figma.showUI(__html__, { 
  width: 280, 
  height: 400,
  title: 'QR Code Generator'
});

// Handle messages from the UI
figma.ui.onmessage = async (message) => {
    switch (message.type) {
        case 'create-svg': {
          try {
            // Create a frame to contain the SVG
            const frame = figma.createFrame();
            frame.name = 'QR Code';
            
            // Create a rectangle as a placeholder
            const rect = figma.createRectangle();
            rect.resize(200, 200);
            rect.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
            
            // Add rectangle to frame
            frame.appendChild(rect);
            frame.resize(200, 200);
            
            // Try to create SVG node
            try {
              // Decode the base64 SVG data
              const svgString = decodeURIComponent(escape(atob(message.svgData)));
              
              // Create nodes from SVG
              const nodes = figma.createNodeFromSvg(svgString);
              
              // Remove the temporary rectangle
              rect.remove();
              
              // Add the SVG nodes to the frame
              if (Array.isArray(nodes)) {
                nodes.forEach(node => frame.appendChild(node));
              } else {
                frame.appendChild(nodes);
              }
              
              // Resize frame to fit content
              frame.resize(200, 200);
              
              // Center in viewport
              frame.x = figma.viewport.center.x - (frame.width / 2);
              frame.y = figma.viewport.center.y - (frame.height / 2);
              
              // Select the frame
              figma.currentPage.selection = [frame];
              figma.viewport.scrollAndZoomIntoView([frame]);
              
              figma.notify('QR code created successfully!');
            } catch (svgError) {
              console.error('SVG Error:', svgError);
              // If SVG creation fails, keep the white rectangle
              frame.x = figma.viewport.center.x - (frame.width / 2);
              frame.y = figma.viewport.center.y - (frame.height / 2);
              figma.currentPage.selection = [frame];
              figma.viewport.scrollAndZoomIntoView([frame]);
              figma.notify('SVG creation failed. Using fallback rectangle.', {error: true});
            }
          } catch (error) {
            console.error('Frame Creation Error:', error);
            figma.notify('Failed to create QR code. Please try again.', {error: true});
          }
          break;
        }
        case 'create-image':
            try {
                // Create a frame to contain the image
                const frame = figma.createFrame();
                frame.name = 'QR Code';
                
                // Create a rectangle as a placeholder
                const rect = figma.createRectangle();
                rect.resize(200, 200);
                rect.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}];
                
                // Add rectangle to frame
                frame.appendChild(rect);
                frame.resize(200, 200);
                
                // Try to create image node
                try {
                    // Extract the base64 data from the data URL
                    const base64Data = message.imageData.split(',')[1];
                    
                    // Convert base64 to Uint8Array
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    
                    // Create the image in Figma
                    const image = figma.createImage(bytes);
                    
                    // Remove the temporary rectangle
                    rect.remove();
                    
                    // Create a new rectangle with the image fill
                    const imageRect = figma.createRectangle();
                    imageRect.resize(200, 200);
                    imageRect.fills = [{
                        type: 'IMAGE',
                        imageHash: image.hash,
                        scaleMode: 'FIT'
                    }];
                    
                    // Add image to frame
                    frame.appendChild(imageRect);
                    
                    // Center in viewport
                    frame.x = figma.viewport.center.x - (frame.width / 2);
                    frame.y = figma.viewport.center.y - (frame.height / 2);
                    
                    // Select the frame
                    figma.currentPage.selection = [frame];
                    figma.viewport.scrollAndZoomIntoView([frame]);
                    
                    figma.notify('QR code created successfully!');
                } catch (imgError) {
                    console.error('Image Error:', imgError);
                    // If image creation fails, keep the white rectangle
                    frame.x = figma.viewport.center.x - (frame.width / 2);
                    frame.y = figma.viewport.center.y - (frame.height / 2);
                    figma.currentPage.selection = [frame];
                    figma.viewport.scrollAndZoomIntoView([frame]);
                    figma.notify('Image creation failed. Using fallback rectangle.', {error: true});
                }
            } catch (error) {
                console.error('Frame Creation Error:', error);
                figma.notify('Failed to create QR code. Please try again.', {error: true});
            }
            break;
        case 'resize':
            figma.ui.resize(280, message.height);
            break;
    }
};

async function createImageNode(imageData, format) {
    try {
        // Extract the base64 data from the data URL
        const base64Data = imageData.split(',')[1];
        // Convert base64 to Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create the image in Figma
        const image = figma.createImage(bytes);
        
        // Create a rectangle to hold the image
        const node = figma.createRectangle();
        
        // Set the size (using the size we used for export)
        const size = 200;
        node.resize(size, size);
        
        // Apply the image fill
        node.fills = [{
            type: 'IMAGE',
            imageHash: image.hash,
            scaleMode: 'FILL'
        }];
        
        // Position the node in the center of the viewport
        node.x = figma.viewport.center.x - (node.width / 2);
        node.y = figma.viewport.center.y - (node.height / 2);
        
        // Select the new node
        figma.currentPage.selection = [node];
        figma.viewport.scrollAndZoomIntoView([node]);
        
        // Notify the user
        figma.notify('PNG QR code created successfully!');
        
    } catch (error) {
        console.error('Error creating image node:', error);
        figma.notify('Error creating QR code. Please try again.', {error: true});
    }
}

// Close the plugin when the user cancels
figma.on('close', () => {
    figma.closePlugin();
});
