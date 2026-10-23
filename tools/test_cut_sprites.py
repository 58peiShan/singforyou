"""去背回歸檢查：python tools/test_cut_sprites.py"""
import unittest

import numpy as np

from cut_sprites import cut


class HairGapTests(unittest.TestCase):
    def image(self, color=(112, 112, 112), location=(slice(30, 36), slice(24, 28))):
        rgb = np.full((160, 160, 3), 112, dtype=np.uint8)
        rgb[15:145, 20:140] = (40, 25, 20)
        rgb[location] = color
        return rgb

    def test_small_enclosed_background_is_removed(self):
        rgba, _ = cut(self.image())
        self.assertEqual(int(rgba[32, 26, 3]), 0)
        self.assertEqual(int(rgba[32, 22, 3]), 255)  # surrounding dark hair remains

    def test_small_gap_cleanup_can_be_disabled(self):
        rgba, _ = cut(self.image(), hair_gap_distance=0)
        self.assertEqual(int(rgba[32, 26, 3]), 255)

    def test_interior_grey_detail_is_preserved(self):
        rgba, _ = cut(self.image(location=(slice(75, 81), slice(75, 79))))
        self.assertEqual(int(rgba[77, 77, 3]), 255)

    def test_tinted_detail_near_outline_is_preserved(self):
        rgba, _ = cut(self.image(color=(118, 108, 108)))
        self.assertEqual(int(rgba[32, 26, 3]), 255)

    def test_single_pixel_detail_is_preserved(self):
        rgba, _ = cut(self.image(location=(slice(30, 31), slice(24, 25))))
        self.assertEqual(int(rgba[30, 24, 3]), 255)

    def test_existing_large_hole_cleanup_still_works(self):
        rgba, _ = cut(self.image(location=(slice(50, 75), slice(50, 75))))
        self.assertEqual(int(rgba[60, 60, 3]), 0)

    def test_local_cleanup_removes_darker_enclosed_grey(self):
        rgb = self.image(color=(91, 93, 96), location=(slice(75, 90), slice(75, 85)))
        rgba, _ = cut(rgb, cleanup_regions=[(70, 70, 95, 95)])
        self.assertEqual(int(rgba[80, 80, 3]), 0)
        self.assertEqual(int(rgba[80, 72, 3]), 255)

    def test_local_cleanup_preserves_same_colour_outside_region(self):
        rgb = self.image(color=(91, 93, 96), location=(slice(75, 90), slice(75, 85)))
        rgba, _ = cut(rgb, cleanup_regions=[(30, 30, 50, 50)])
        self.assertEqual(int(rgba[80, 80, 3]), 255)

    def test_local_cleanup_preserves_skin_and_squid_colour(self):
        for color in [(240, 165, 110), (120, 80, 65)]:
            with self.subTest(color=color):
                rgb = self.image(color=color)
                rgba, _ = cut(rgb, cleanup_regions=[(20, 20, 40, 45)])
                self.assertEqual(int(rgba[32, 26, 3]), 255)


if __name__ == "__main__":
    unittest.main()
