(function () {
  'use strict';

  const LANGS = {
    en: { name: 'English',   flag: '🇬🇧', dir: 'ltr' },
    es: { name: 'Español',   flag: '🇪🇸', dir: 'ltr' },
    fr: { name: 'Français',  flag: '🇫🇷', dir: 'ltr' },
    pt: { name: 'Português', flag: '🇧🇷', dir: 'ltr' },
    de: { name: 'Deutsch',   flag: '🇩🇪', dir: 'ltr' },
    ar: { name: 'العربية',  flag: '🇸🇦', dir: 'rtl' },
    zh: { name: '中文',       flag: '🇨🇳', dir: 'ltr' },
    ja: { name: '日本語',     flag: '🇯🇵', dir: 'ltr' },
    ru: { name: 'Русский',   flag: '🇷🇺', dir: 'ltr' },
  };

  // Map of exact English strings → per-language translations
  const T = {
    // ── Navigation ──
    'Home':         { es:'Inicio',          fr:'Accueil',              pt:'Início',            de:'Startseite',          ar:'الرئيسية',          zh:'首页',     ja:'ホーム',           ru:'Главная' },
    'How It Works': { es:'Cómo Funciona',   fr:'Comment ça marche',    pt:'Como Funciona',     de:'So funktioniert es',  ar:'كيف يعمل',          zh:'如何运作',  ja:'仕組み',           ru:'Как это работает' },
    'Features':     { es:'Características', fr:'Fonctionnalités',      pt:'Recursos',          de:'Funktionen',          ar:'المميزات',          zh:'功能',     ja:'機能',             ru:'Возможности' },
    'About':        { es:'Nosotros',        fr:'À propos',             pt:'Sobre',             de:'Über uns',            ar:'من نحن',            zh:'关于',     ja:'概要',             ru:'О нас' },
    'Real Estate':  { es:'Bienes Raíces',   fr:'Immobilier',           pt:'Imóveis',           de:'Immobilien',          ar:'العقارات',          zh:'房地产',   ja:'不動産',           ru:'Недвижимость' },
    'Contact':      { es:'Contacto',        fr:'Contact',              pt:'Contato',           de:'Kontakt',             ar:'تواصل',             zh:'联系',     ja:'お問い合わせ',      ru:'Контакты' },
    'Sign In':      { es:'Iniciar Sesión',  fr:'Se Connecter',         pt:'Entrar',            de:'Anmelden',            ar:'تسجيل الدخول',     zh:'登录',     ja:'サインイン',        ru:'Войти' },
    'Get Started':  { es:'Comenzar',        fr:'Commencer',            pt:'Começar',           de:'Loslegen',            ar:'ابدأ',              zh:'开始',     ja:'始める',           ru:'Начать' },
    '← Back to Sign In': { es:'← Volver',  fr:'← Retour',            pt:'← Voltar',          de:'← Zurück',            ar:'← رجوع',            zh:'← 返回',  ja:'← 戻る',           ru:'← Назад' },
    'Create Account →': { es:'Crear Cuenta →', fr:'Créer un Compte →', pt:'Criar Conta →',   de:'Konto erstellen →',   ar:'إنشاء حساب →',     zh:'创建账户 →',ja:'アカウント作成 →',  ru:'Создать аккаунт →' },

    // ── Hero ──
    'Now Live · Automated Crypto Investment': { es:'En vivo · Inversión Cripto Automatizada', fr:'En direct · Investissement Crypto Automatisé', pt:'Ao Vivo · Investimento Cripto Automatizado', de:'Jetzt live · Auto-Krypto-Investment', ar:'مباشر الآن · استثمار تشفير آلي', zh:'现已上线 · 自动化加密投资', ja:'ライブ · 自動化暗号資産投資', ru:'В прямом эфире · Авто крипто-инвестиции' },
    'Get Started Free':  { es:'Comenzar Gratis',    fr:'Commencer Gratuitement', pt:'Começar Gratuitamente', de:'Kostenlos starten',   ar:'ابدأ مجاناً',         zh:'免费开始',  ja:'無料で始める',      ru:'Начать бесплатно' },
    'See How It Works':  { es:'Ver Cómo Funciona',  fr:'Voir comment ça marche', pt:'Ver Como Funciona',     de:'So funktioniert es',  ar:'شاهد كيف يعمل',       zh:'了解运作方式',ja:'仕組みを見る',    ru:'Узнать как работает' },
    'Yield Layers':      { es:'Capas de Rendimiento',fr:'Couches de Rendement',  pt:'Camadas de Rendimento', de:'Ertragsschichten',    ar:'طبقات العائد',        zh:'收益层',    ja:'収益層',           ru:'Уровни доходности' },
    'Automation':        { es:'Automatización',     fr:'Automatisation',         pt:'Automatização',         de:'Automatisierung',     ar:'أتمتة',               zh:'自动化',    ja:'自動化',           ru:'Автоматизация' },
    'Investment Tiers':  { es:'Niveles de Inversión',fr:"Niveaux d'Investissement",pt:'Níveis de Investimento',de:'Investitionsstufen',ar:'مستويات الاستثمار',  zh:'投资层级',  ja:'投資ティア',        ru:'Уровни инвестиций' },

    // ── Section labels ──
    'System Architecture':   { es:'Arquitectura del Sistema',       fr:'Architecture du Système',       pt:'Arquitetura do Sistema',    de:'Systemarchitektur',       ar:'هيكل النظام',       zh:'系统架构',    ja:'システム設計',           ru:'Архитектура системы' },
    'Platform Features':     { es:'Características de la Plataforma',fr:'Fonctionnalités de la Plateforme',pt:'Recursos da Plataforma',  de:'Plattformfunktionen',     ar:'ميزات المنصة',      zh:'平台功能',    ja:'プラットフォーム機能',   ru:'Возможности платформы' },
    'Built for Trust':       { es:'Construido para la Confianza',   fr:'Conçu pour la Confiance',       pt:'Construído para a Confiança',de:'Für Vertrauen gebaut',    ar:'مبني على الثقة',    zh:'构建于信任',  ja:'信頼のために',           ru:'Построен на доверии' },
    'Our Story':             { es:'Nuestra Historia',               fr:'Notre Histoire',                pt:'Nossa História',            de:'Unsere Geschichte',       ar:'قصتنا',             zh:'我们的故事',  ja:'私たちの物語',           ru:'Наша история' },
    'Core Values':           { es:'Valores Fundamentales',          fr:'Valeurs Fondamentales',         pt:'Valores Fundamentais',      de:'Grundwerte',              ar:'القيم الأساسية',    zh:'核心价值观',  ja:'コアバリュー',           ru:'Основные ценности' },
    'Get in Touch':          { es:'Ponte en Contacto',              fr:'Prenez Contact',                pt:'Entre em Contato',          de:'Kontakt aufnehmen',       ar:'تواصل معنا',        zh:'联系我们',   ja:'お問い合わせ',           ru:'Свяжитесь с нами' },
    'Early Access':          { es:'Acceso Anticipado',              fr:'Accès Anticipé',                pt:'Acesso Antecipado',         de:'Frühzeitiger Zugang',     ar:'وصول مبكر',         zh:'早期访问',   ja:'早期アクセス',           ru:'Ранний доступ' },
    'Tokenized Real Estate': { es:'Bienes Raíces Tokenizados',     fr:'Immobilier Tokenisé',           pt:'Imóveis Tokenizados',       de:'Tokenisierte Immobilien', ar:'العقارات المرمّزة', zh:'代币化房地产', ja:'トークン化不動産',       ru:'Токенизированная недвижимость' },

    // ── Section titles ──
    'One platform.':        { es:'Una plataforma.',         fr:'Une plateforme.',           pt:'Uma plataforma.',          de:'Eine Plattform.',        ar:'منصة واحدة.',          zh:'一个平台。',    ja:'一つのプラットフォーム。', ru:'Одна платформа.' },
    'Three yield engines.': { es:'Tres motores de rendimiento.', fr:'Trois moteurs de rendement.', pt:'Três motores de rendimento.', de:'Drei Ertragsmaschinen.', ar:'ثلاثة محركات عائد.', zh:'三个收益引擎。', ja:'3つの収益エンジン。', ru:'Три двигателя доходности.' },
    'Three engines.':       { es:'Tres motores.',           fr:'Trois moteurs.',            pt:'Três motores.',            de:'Drei Motoren.',          ar:'ثلاثة محركات.',        zh:'三个引擎。',    ja:'3つのエンジン。',          ru:'Три двигателя.' },
    'Built to perform.':    { es:'Diseñados para rendir.',  fr:'Conçus pour performer.',    pt:'Feitos para performar.',   de:'Gebaut um zu leisten.',  ar:'مصممة للأداء.',        zh:'为表现而生。',  ja:'パフォーマンスのために。', ru:'Созданы для работы.' },
    'The Vision':           { es:'La Visión',               fr:'La Vision',                 pt:'A Visão',                 de:'Die Vision',             ar:'الرؤية',               zh:'愿景',         ja:'ビジョン',                ru:'Видение' },
    'Where We Stand':       { es:'Donde Estamos',           fr:'Où Nous en Sommes',         pt:'Onde Estamos',            de:'Wo wir stehen',          ar:'أين نحن',              zh:'我们的现状',   ja:'現在の状況',              ru:'Где мы стоим' },
    'Available Properties': { es:'Propiedades Disponibles', fr:'Propriétés Disponibles',    pt:'Propriedades Disponíveis', de:'Verfügbare Objekte',     ar:'العقارات المتاحة',     zh:'可用房产',     ja:'利用可能な物件',          ru:'Доступные объекты' },
    'Be part of the beginning.': { es:'Sé parte del comienzo.', fr:'Faites partie du début.', pt:'Faça parte do início.', de:'Sei Teil des Anfangs.', ar:'كن جزءاً من البداية.', zh:'成为起点的一部分。', ja:'始まりの一部になる。', ru:'Будьте частью начала.' },

    // ── Cards ──
    'Validator Pool Engine': { es:'Motor del Pool de Validadores', fr:'Moteur de Pool de Validateurs', pt:'Motor do Pool de Validadores', de:'Validatorpool-Engine', ar:'محرك مجموعة المدققين', zh:'验证器池引擎', ja:'バリデータープールエンジン', ru:'Движок пула валидаторов' },
    'Trading Bot':           { es:'Bot de Trading',   fr:'Bot de Trading',   pt:'Bot de Trading',   de:'Trading-Bot',      ar:'بوت التداول',    zh:'交易机器人',  ja:'トレーディングボット', ru:'Торговый бот' },
    'Portfolio Brain':       { es:'Cerebro del Portafolio', fr:'Cerveau du Portefeuille', pt:'Cérebro do Portfólio', de:'Portfolio-Gehirn', ar:'عقل المحفظة', zh:'投资组合大脑', ja:'ポートフォリオブレイン', ru:'Портфельный мозг' },
    'Transparency':  { es:'Transparencia',  fr:'Transparence',   pt:'Transparência',  de:'Transparenz',   ar:'الشفافية',     zh:'透明度',   ja:'透明性',        ru:'Прозрачность' },
    'Non-Custody':   { es:'Sin Custodia',   fr:'Non-Garde',      pt:'Sem Custódia',   de:'Kein Depot',    ar:'بدون حضانة',  zh:'非托管',   ja:'非カストディ',   ru:'Без хранения' },
    'Risk First':    { es:'Riesgo Primero', fr:"Risque d'abord", pt:'Risco Primeiro',  de:'Risiko zuerst', ar:'الأمان أولاً', zh:'风险优先', ja:'リスク優先',     ru:'Риск прежде всего' },

    // ── Buttons ──
    'Create Account':      { es:'Crear Cuenta',          fr:'Créer un Compte',            pt:'Criar Conta',            de:'Konto erstellen',          ar:'إنشاء حساب',            zh:'创建账户',   ja:'アカウント作成',          ru:'Создать аккаунт' },
    'Register Interest →': { es:'Registrar Interés →',   fr:'Manifester son intérêt →',   pt:'Registrar Interesse →',  de:'Interesse anmelden →',     ar:'سجّل اهتمامك →',        zh:'注册兴趣 →', ja:'関心を登録 →',            ru:'Зарегистрировать интерес →' },
    'Send Message →':      { es:'Enviar Mensaje →',      fr:'Envoyer un Message →',       pt:'Enviar Mensagem →',      de:'Nachricht senden →',       ar:'إرسال رسالة →',         zh:'发送消息 →', ja:'メッセージを送る →',       ru:'Отправить сообщение →' },

    // ── Form labels ──
    'Full Name':         { es:'Nombre Completo',    fr:'Nom Complet',           pt:'Nome Completo',     de:'Vollständiger Name',  ar:'الاسم الكامل',         zh:'全名',     ja:'フルネーム',        ru:'Полное имя' },
    'Email Address':     { es:'Correo Electrónico', fr:'Adresse Email',         pt:'Endereço de Email', de:'E-Mail-Adresse',      ar:'البريد الإلكتروني',   zh:'电子邮箱',  ja:'メールアドレス',    ru:'Электронная почта' },
    'Email':             { es:'Correo',             fr:'Email',                 pt:'Email',             de:'E-Mail',              ar:'البريد الإلكتروني',   zh:'邮箱',     ja:'メール',            ru:'Почта' },
    'Password':          { es:'Contraseña',         fr:'Mot de passe',          pt:'Senha',             de:'Passwort',            ar:'كلمة المرور',         zh:'密码',     ja:'パスワード',        ru:'Пароль' },
    'Confirm Password':  { es:'Confirmar Contraseña',fr:'Confirmer le Mot de passe',pt:'Confirmar Senha',de:'Passwort bestätigen',ar:'تأكيد كلمة المرور',  zh:'确认密码',  ja:'パスワードの確認',   ru:'Подтвердить пароль' },
    'Crypto Experience': { es:'Experiencia en Cripto',fr:'Expérience Crypto',  pt:'Experiência em Cripto',de:'Krypto-Erfahrung',ar:'خبرة التشفير',         zh:'加密货币经验',ja:'暗号資産経験',     ru:'Опыт с криптовалютой' },
    'Primary Interest':  { es:'Interés Principal',  fr:'Intérêt Principal',     pt:'Interesse Principal', de:'Hauptinteresse',    ar:'الاهتمام الرئيسي',    zh:'主要兴趣',  ja:'主な関心',          ru:'Основной интерес' },
    'Message':           { es:'Mensaje',            fr:'Message',               pt:'Mensagem',           de:'Nachricht',           ar:'رسالة',               zh:'消息',     ja:'メッセージ',        ru:'Сообщение' },
    'Subject':           { es:'Asunto',             fr:'Sujet',                 pt:'Assunto',            de:'Betreff',             ar:'الموضوع',             zh:'主题',     ja:'件名',              ru:'Тема' },

    // ── Footer ──
    'Platform':  { es:'Plataforma', fr:'Plateforme',   pt:'Plataforma', de:'Plattform',         ar:'المنصة',    zh:'平台',   ja:'プラットフォーム', ru:'Платформа' },
    'Company':   { es:'Empresa',    fr:'Entreprise',   pt:'Empresa',    de:'Unternehmen',       ar:'الشركة',    zh:'公司',   ja:'会社',             ru:'Компания' },
    'Legal':     { es:'Legal',      fr:'Légal',        pt:'Legal',      de:'Rechtliches',       ar:'القانوني',  zh:'法律',   ja:'法的事項',         ru:'Юридическое' },
    'Privacy':   { es:'Privacidad', fr:'Confidentialité',pt:'Privacidade',de:'Datenschutz',    ar:'الخصوصية',  zh:'隐私',   ja:'プライバシー',     ru:'Конфиденциальность' },
    'Terms':     { es:'Términos',   fr:'Conditions',   pt:'Termos',     de:'Nutzungsbedingungen',ar:'الشروط',  zh:'条款',   ja:'利用規約',         ru:'Условия' },
    'Risk Disclosure': { es:'Divulgación de Riesgos', fr:'Divulgation des Risques', pt:'Divulgação de Risco', de:'Risikohinweise', ar:'الإفصاح عن المخاطر', zh:'风险披露', ja:'リスク開示', ru:'Раскрытие рисков' },
    'Automated crypto investment.': { es:'Inversión cripto automatizada.', fr:'Investissement crypto automatisé.', pt:'Investimento cripto automatizado.', de:'Automatisierte Krypto-Investition.', ar:'استثمار تشفير آلي.', zh:'自动化加密投资。', ja:'自動化暗号資産投資。', ru:'Автоматизированные крипто-инвестиции.' },

    // ── Auth pages ──
    'Welcome back.':           { es:'Bienvenido de nuevo.',    fr:'Bon retour.',                 pt:'Bem-vindo de volta.',    de:'Willkommen zurück.',      ar:'مرحباً بعودتك.',          zh:'欢迎回来。',    ja:'おかえりなさい。',           ru:'С возвращением.' },
    'Forgot password?':        { es:'¿Olvidaste tu contraseña?',fr:'Mot de passe oublié?',      pt:'Esqueceu a senha?',      de:'Passwort vergessen?',     ar:'نسيت كلمة المرور؟',       zh:'忘记密码？',    ja:'パスワードをお忘れですか？', ru:'Забыли пароль?' },
    'Sign In with MetaMask':   { es:'Iniciar sesión con MetaMask',fr:'Se connecter avec MetaMask',pt:'Entrar com MetaMask',  de:'Mit MetaMask anmelden',   ar:'الدخول عبر MetaMask',     zh:'用MetaMask登录', ja:'MetaMaskでサインイン',      ru:'Войти с MetaMask' },
    'Connect MetaMask Wallet': { es:'Conectar Cartera MetaMask',fr:'Connecter le Portefeuille MetaMask',pt:'Conectar Carteira MetaMask',de:'MetaMask Wallet verbinden',ar:'ربط محفظة MetaMask',zh:'连接MetaMask钱包',ja:'MetaMaskウォレットを接続',ru:'Подключить кошелёк MetaMask' },
    'Create one free':         { es:'Crea una gratis',         fr:"Créez-en un gratuitement",   pt:'Crie uma gratuitamente', de:'Kostenloses Konto erstellen',ar:'أنشئ واحداً مجاناً',   zh:'免费创建',      ja:'無料で作成',                 ru:'Создать бесплатно' },
    'Check your email':        { es:'Revisa tu correo',        fr:'Vérifiez votre email',        pt:'Verifique seu email',    de:'Prüfen Sie Ihre E-Mail',  ar:'تحقق من بريدك الإلكتروني',zh:'检查您的邮箱',  ja:'メールを確認',               ru:'Проверьте почту' },
    'Verify & Sign In →':      { es:'Verificar y Entrar →',   fr:'Vérifier et Se Connecter →', pt:'Verificar e Entrar →',   de:'Verifizieren & Anmelden →',ar:'تحقق وتسجيل الدخول →',  zh:'验证并登录 →',  ja:'確認してサインイン →',        ru:'Проверить и войти →' },
  };

  const STORAGE_KEY = 'thanod_lang';

  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGS[stored]) return stored;
    const nav = (navigator.language || navigator.userLanguage || 'en').split('-')[0].toLowerCase();
    return LANGS[nav] ? nav : 'en';
  }

  function applyTranslation(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang]?.dir || 'ltr';
    if (lang === 'en') return;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const tag = node.parentElement?.tagName?.toLowerCase();
        if (['script', 'style', 'noscript'].includes(tag)) return NodeFilter.FILTER_REJECT;
        return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      const trimmed = node.textContent.trim();
      if (T[trimmed]?.[lang]) {
        const leading  = node.textContent.match(/^\s*/)[0];
        const trailing = node.textContent.match(/\s*$/)[0];
        node.textContent = leading + T[trimmed][lang] + trailing;
      }
    });

    document.querySelectorAll('[placeholder]').forEach(el => {
      const ph = el.getAttribute('placeholder');
      if (T[ph]?.[lang]) el.setAttribute('placeholder', T[ph][lang]);
    });
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    location.reload();
  }

  function buildPicker(containerId) {
    const container = document.getElementById(containerId || 'langPickerContainer');
    if (!container) return;
    const current = detectLang();
    const info = LANGS[current];
    container.innerHTML = `
      <div class="lang-picker">
        <button class="lang-btn" onclick="langMenuToggle(event)">
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span>${info.flag} ${current.toUpperCase()}</span>
          <svg width="9" height="9" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="lang-menu" id="langMenu_${containerId || 'langPickerContainer'}">
          ${Object.entries(LANGS).map(([code, l]) =>
            `<button class="lang-option${code === current ? ' active' : ''}" onclick="window.i18n.set('${code}')">${l.flag} ${l.name}</button>`
          ).join('')}
        </div>
      </div>`;
  }

  window.langMenuToggle = function (e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const menu = btn.closest('.lang-picker')?.querySelector('.lang-menu');
    if (menu) menu.classList.toggle('open');
  };

  document.addEventListener('click', () => {
    document.querySelectorAll('.lang-menu.open').forEach(m => m.classList.remove('open'));
  });

  window.i18n = { set: setLang, apply: applyTranslation, detect: detectLang, langs: LANGS };

  document.addEventListener('DOMContentLoaded', () => {
    const lang = detectLang();
    applyTranslation(lang);
    buildPicker('langPickerContainer');
    buildPicker('langPickerMobile');
  });
})();
