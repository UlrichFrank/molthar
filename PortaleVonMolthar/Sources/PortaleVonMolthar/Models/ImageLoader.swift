import SwiftUI

#if os(macOS)
import AppKit
#else
import UIKit
#endif

/// A utility extension to load image assets bundled with the Swift Package
extension Image {
    static func bundleImage(named: String) -> Image {
        #if os(macOS)
        if let nsImage = Bundle.module.image(forResource: named) {
            return Image(nsImage: nsImage)
        }
        #else
        if let uiImage = UIImage(named: named, in: Bundle.module, with: nil) {
            return Image(uiImage: uiImage)
        }
        #endif
        
        // Fallback for missing images
        print("Warning: Image \(named) not found in bundle")
        return Image(systemName: "photo")
    }
}
