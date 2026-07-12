// Compat.swift — empty on iOS.
//
// This machine's typecheck pass runs against the macOS SDK (no Xcode/iOS SDK
// installed), so the handful of iOS-only SwiftUI APIs get no-op/equivalent
// stand-ins here, gated to macOS. The iOS build never sees any of this.
#if os(macOS)
import SwiftUI

extension View {
    /// iOS-only presentation → plain sheet on macOS for typechecking.
    func fullScreenCover<Content: View>(
        isPresented: Binding<Bool>,
        onDismiss: (() -> Void)? = nil,
        @ViewBuilder content: @escaping () -> Content
    ) -> some View {
        sheet(isPresented: isPresented, onDismiss: onDismiss, content: content)
    }
}
#endif
