import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTranslator, detectLang } from './i18n';

function stubLanguages(languages: string[], language = languages[0]) {
  vi.stubGlobal('navigator', { languages, language });
}

describe('界面语言', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('按浏览器首选语言匹配', () => {
    stubLanguages(['ja-JP', 'en-US']);
    expect(detectLang()).toBe('ja');
  });

  it('中文（含繁体）都回落到中文界面', () => {
    stubLanguages(['zh-Hant-TW']);
    expect(detectLang()).toBe('zh');
  });

  it('逐个匹配语言列表，跳过不支持的语种', () => {
    stubLanguages(['de-DE', 'ko-KR', 'en-US']);
    expect(detectLang()).toBe('ko');
  });

  it('全部不支持时回退英语', () => {
    stubLanguages(['de-DE', 'ru-RU']);
    expect(detectLang()).toBe('en');
  });
});

describe('文案插值', () => {
  it('替换全部占位符', () => {
    const t = createTranslator('zh');
    expect(t('matchedHint', { matched: 7, max: 48 })).toContain('7/48');
  });

  it('未提供的占位符保持原样', () => {
    const t = createTranslator('en');
    expect(t('showAlt')).toContain('{lang}');
  });
});
