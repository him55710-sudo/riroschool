import { expect, test, describe } from 'vitest';
import { JobCreateSchema } from '../src/schema';

describe('Schema Validations', () => {
    test('Validates correctly for a normal UI event', () => {
        const valid = { topic: "AI in Education", language: "English", tier: "FREE" };
        expect(() => JobCreateSchema.parse(valid)).not.toThrow();
    });

    test('Fails on empty topic', () => {
        const invalid = { topic: "A", tier: "FREE" };
        expect(() => JobCreateSchema.parse(invalid)).toThrow("Topic must be at least 2 characters");
    });

    test('Defaults to Korean when language is omitted', () => {
        const data = { topic: "Data Science", tier: "FREE" };
        const parsed = JobCreateSchema.parse(data);
        expect(parsed.language).toBe("Korean");
    });
});
