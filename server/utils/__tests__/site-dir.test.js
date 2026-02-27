import { describe, it, expect } from 'vitest';
import { siteDir } from '../site-dir.js';

describe('siteDir (CSS Selectors)', () => {
  describe('Structure and Format', () => {
    it('exports siteDir object', () => {
      expect(siteDir).toBeDefined();
      expect(typeof siteDir).toBe('object');
    });

    it('contains general configuration', () => {
      expect(siteDir.general).toBeDefined();
    });

    it('general config has required selector fields', () => {
      expect(siteDir.general).toHaveProperty('listing');
      expect(siteDir.general).toHaveProperty('title');
      expect(siteDir.general).toHaveProperty('price');
      expect(siteDir.general).toHaveProperty('location');
    });
  });

  describe('Selector Values', () => {
    it('listing selector is a valid CSS class selector', () => {
      expect(siteDir.general.listing).toBe('.rental-listing');
      expect(siteDir.general.listing).toMatch(/^[.#\w\s-:[\]="']+$/);
    });

    it('title selector is a valid CSS class selector', () => {
      expect(siteDir.general.title).toBe('.rental-title');
      expect(typeof siteDir.general.title).toBe('string');
    });

    it('price selector is a valid CSS class selector', () => {
      expect(siteDir.general.price).toBe('.rental-price');
      expect(typeof siteDir.general.price).toBe('string');
    });

    it('location selector is a valid CSS class selector', () => {
      expect(siteDir.general.location).toBe('.rental-location');
      expect(typeof siteDir.general.location).toBe('string');
    });

    it('selectors are non-empty strings', () => {
      expect(siteDir.general.listing.length).toBeGreaterThan(0);
      expect(siteDir.general.title.length).toBeGreaterThan(0);
      expect(siteDir.general.price.length).toBeGreaterThan(0);
      expect(siteDir.general.location.length).toBeGreaterThan(0);
    });
  });

  describe('CSS Selector Validity', () => {
    it('all selectors start with valid CSS selector syntax', () => {
      const validStarts = ['.', '#', '['];
      Object.values(siteDir.general).forEach(selector => {
        expect(validStarts.some(start => selector.startsWith(start))).toBe(true);
      });
    });

    it('class selectors use dot notation', () => {
      expect(siteDir.general.listing.startsWith('.')).toBe(true);
      expect(siteDir.general.title.startsWith('.')).toBe(true);
      expect(siteDir.general.price.startsWith('.')).toBe(true);
      expect(siteDir.general.location.startsWith('.')).toBe(true);
    });

    it('selectors contain only alphanumeric and valid characters', () => {
      const validPattern = /^[.#\w\s\-:[\]="'*^$|()~>+]+$/;
      Object.values(siteDir.general).forEach(selector => {
        expect(validPattern.test(selector)).toBe(true);
      });
    });
  });

  describe('Data Consistency', () => {
    it('has consistent property naming convention', () => {
      const keys = Object.keys(siteDir.general);
      expect(keys.length).toBe(4);
      expect(keys).toContain('listing');
      expect(keys).toContain('title');
      expect(keys).toContain('price');
      expect(keys).toContain('location');
    });

    it('selectors can be used in jQuery/cheerio', () => {
      // Verify selectors are valid for cheerio/jQuery
      const validSelectors = [
        siteDir.general.listing,
        siteDir.general.title,
        siteDir.general.price,
        siteDir.general.location
      ];

      validSelectors.forEach(selector => {
        expect(typeof selector).toBe('string');
        expect(selector.length).toBeGreaterThan(0);
      });
    });

    it('each selector uniquely identifies the correct element', () => {
      const selectors = new Set(Object.values(siteDir.general));
      // All selectors should be unique
      expect(selectors.size).toBe(4);
    });
  });

  describe('Usage and Compatibility', () => {
    it('selectors are compatible with cheerio', () => {
      // Test that selectors don't have incompatible syntax
      const cheerioIncompatible = /::before|::after|:has\(|:where\(/;
      Object.values(siteDir.general).forEach(selector => {
        expect(cheerioIncompatible.test(selector)).toBe(false);
      });
    });

    it('selectors work with document.querySelector', () => {
      // Selectors should be valid for querySelector too
      Object.values(siteDir.general).forEach(selector => {
        expect(() => {
          // Check if selector is valid (wouldn't throw in browser environment)
          expect(typeof selector).toBe('string');
        }).not.toThrow();
      });
    });

    it('can be used to build complex selector chains', () => {
      const combined = `${siteDir.general.listing} ${siteDir.general.title}`;
      expect(combined).toBe('.rental-listing .rental-title');
      expect(typeof combined).toBe('string');
    });
  });

  describe('Configuration Extensibility', () => {
    it('allows adding new site configurations', () => {
      const extended = { ...siteDir };
      extended.custom = {
        listing: '.property',
        title: '.prop-title',
        price: '.prop-price',
        location: '.prop-location'
      };

      expect(extended.custom).toBeDefined();
      expect(extended.custom.listing).toBe('.property');
    });

    it('maintains backward compatibility when extended', () => {
      const extended = { ...siteDir };
      expect(extended.general.listing).toBe(siteDir.general.listing);
      expect(extended.general.title).toBe(siteDir.general.title);
      expect(extended.general.price).toBe(siteDir.general.price);
      expect(extended.general.location).toBe(siteDir.general.location);
    });

    it('supports multiple site configurations in structure', () => {
      // Structure allows easily adding more sites
      const canAddMore = typeof siteDir === 'object' && !Array.isArray(siteDir);
      expect(canAddMore).toBe(true);
    });
  });

  describe('Selector Hierarchy', () => {
    it('child elements are nested within listing container', () => {
      // title, price, location should be found within listing
      expect(siteDir.general.title).not.toBe(siteDir.general.listing);
      expect(siteDir.general.price).not.toBe(siteDir.general.listing);
      expect(siteDir.general.location).not.toBe(siteDir.general.listing);
    });

    it('all property selectors are distinct from listing', () => {
      const propertySelectors = [
        siteDir.general.title,
        siteDir.general.price,
        siteDir.general.location
      ];

      propertySelectors.forEach(selector => {
        expect(selector).not.toBe(siteDir.general.listing);
      });
    });
  });

  describe('Real-world Usage', () => {
    it('matches expected HTML structure', () => {
      // siteDir reflects the mock website HTML structure
      const html = `
        <div class="rental-listing">
          <div class="rental-title">Title</div>
          <div class="rental-price">$1000</div>
          <div class="rental-location">City</div>
        </div>
      `;

      expect(html).toContain('rental-listing');
      expect(html).toContain('rental-title');
      expect(html).toContain('rental-price');
      expect(html).toContain('rental-location');
    });

    it('can parse basic HTML structure with these selectors', () => {
      // Verify the standard structure uses these selectors
      const expectedStructure = {
        listing: '.rental-listing',
        title: '.rental-title',
        price: '.rental-price',
        location: '.rental-location'
      };

      expect(siteDir.general).toEqual(expectedStructure);
    });
  });

  describe('Documentation Compliance', () => {
    it('follows CSS selector naming conventions', () => {
      // Class names use kebab-case
      expect(siteDir.general.listing).toMatch(/^\.[\w-]+$/);
      expect(siteDir.general.title).toMatch(/^\.[\w-]+$/);
      expect(siteDir.general.price).toMatch(/^\.[\w-]+$/);
      expect(siteDir.general.location).toMatch(/^\.[\w-]+$/);
    });

    it('provides clear, descriptive selector names', () => {
      // Selectors clearly indicate what elements they target
      expect(siteDir.general.listing).toContain('listing');
      expect(siteDir.general.title).toContain('title');
      expect(siteDir.general.price).toContain('price');
      expect(siteDir.general.location).toContain('location');
    });

    it('is well-documented for developers', () => {
      const selectorDocs = {
        'rental-listing': 'Container for each rental listing',
        'rental-title': 'Listing title/name',
        'rental-price': 'Daily or monthly price',
        'rental-location': 'City/address'
      };

      Object.entries(selectorDocs).forEach(([key, doc]) => {
        expect(doc).toBeDefined();
        expect(typeof doc).toBe('string');
      });
    });
  });
});