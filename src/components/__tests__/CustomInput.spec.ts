import {mount} from '@vue/test-utils';
import {describe, it, expect, beforeEach} from 'vitest';
import CustomInput from '@/components/CustomInput/CustomInput.vue';

interface CustomInputInstance {
    inputValue: string;
}

describe('CustomInput.vue', () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(CustomInput);
    });

    it('renders with initial value and placeholder', () => {
        const input = wrapper.find('input');
        expect(input.element.value).toBe('');
        expect(input.attributes('placeholder')).toBe('MM/DD/YYYY');
    });

    it('sets cursor to start on first focus and moves cursor correctly on subsequent focuses', async () => {
        const input = wrapper.find('input');
        await input.trigger('focus');
        expect((wrapper.vm as unknown as CustomInputInstance).inputValue).toBe('__/__/____');
    });

    it('handles valid input correctly', async () => {
        const input = wrapper.find('input');
        await input.setValue('12/12/2023');
        await input.trigger('input');
        expect((wrapper.vm as unknown as CustomInputInstance).inputValue).toBe('12/12/2023');
        expect(wrapper.emitted()['update:modelValue'][0]).toEqual(['2023-12-12']);
    });

    it('prevents invalid key inputs', async () => {
        const input = wrapper.find('input');
        await input.trigger('keydown', {key: 'a'});
        expect(input.element.value).toBe('');
        await input.trigger('keydown', {key: '!'});
        expect(input.element.value).toBe('');
    });
});
