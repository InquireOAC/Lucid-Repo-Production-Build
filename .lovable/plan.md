
## Fix Banner/Button Overlap and Add Header Image Upload

### Problem
The gradient banner extends too far down, overlapping the Follow and Message buttons. The buttons need to sit fully below the banner on the dark background area.

### Solution

#### 1. Fix the banner height and button positioning
- Reduce the banner height back to a smaller size (e.g., `h-28 sm:h-36`) so it ends above the action buttons
- Move the action buttons lower so they sit entirely on the dark background, not overlapping the gradient
- Restructure the layout: keep the avatar overlapping the banner, but position the buttons below the banner line

#### 2. Add `banner_image` column to the `profiles` table
- Add a new migration to create a `banner_image TEXT` column on the `profiles` table to store the URL of an uploaded header image

#### 3. Upload header image functionality
- Add an image upload button on the banner (visible only for own profile) using Supabase Storage
- Create a `profile-banners` storage bucket for the images
- When a user uploads an image, store it in Supabase Storage and save the URL to `profiles.banner_image`

#### 4. Display the header image
- Update `ProfileBanner` to accept and display a `bannerImage` URL prop
- If a banner image exists, show it as a cover image; otherwise fall back to the gradient

---

### Technical Details

**Files to modify:**
- `src/components/profile/ProfileBanner.tsx` -- accept `bannerImage` and `isOwnProfile` props; show image or gradient; add camera/upload icon overlay for own profile
- `src/components/profile/ProfileHeader.tsx` -- reduce banner overlap; adjust `-mt-` value and button positioning so buttons are fully below the banner; pass `bannerImage` and `isOwnProfile` to `ProfileBanner`
- `src/components/profile/EditProfileDialog.tsx` -- optionally add banner upload here as well
- `src/components/profile/ProfileMainContent.tsx` -- pass banner image data through

**Database changes:**
- Migration: `ALTER TABLE profiles ADD COLUMN banner_image TEXT;`
- Storage: create `profile-banners` bucket (public)

**Upload flow:**
1. User clicks camera icon on banner
2. File picker opens, user selects image
3. Image is uploaded to `profile-banners/{user_id}/banner.{ext}` in Supabase Storage
4. The public URL is saved to `profiles.banner_image`
5. Banner re-renders with the new image

**Layout fix approach:**
- Change banner height to `h-28 sm:h-36`
- Adjust the avatar/button row: keep avatar overlapping with `-mt-12`, but move buttons to `items-start pt-2` so they render below the banner edge on the dark background
