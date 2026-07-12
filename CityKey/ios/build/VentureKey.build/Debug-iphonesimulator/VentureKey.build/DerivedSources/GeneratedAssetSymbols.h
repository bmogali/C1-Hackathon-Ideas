#import <Foundation/Foundation.h>

#if __has_attribute(swift_private)
#define AC_SWIFT_PRIVATE __attribute__((swift_private))
#else
#define AC_SWIFT_PRIVATE
#endif

/// The resource bundle ID.
static NSString * const ACBundleID AC_SWIFT_PRIVATE = @"com.hackathon.VentureKey";

/// The "AccentColor" asset catalog color resource.
static NSString * const ACColorNameAccentColor AC_SWIFT_PRIVATE = @"AccentColor";

/// The "CapitalOneLogoDark" asset catalog image resource.
static NSString * const ACImageNameCapitalOneLogoDark AC_SWIFT_PRIVATE = @"CapitalOneLogoDark";

/// The "CapitalOneLogoLight" asset catalog image resource.
static NSString * const ACImageNameCapitalOneLogoLight AC_SWIFT_PRIVATE = @"CapitalOneLogoLight";

#undef AC_SWIFT_PRIVATE
