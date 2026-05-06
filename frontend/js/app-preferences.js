(function () {
  const STORAGE_KEY = "mynote_preferencias_site";

  const defaults = {
    tema: "claro",
    tema_fundo: "creme",
    idioma: "pt-BR",
    fuso_horario: "America/Sao_Paulo",
    formato_hora: "24",
    inicio_semana: "monday",
    backup_automatico: true,
  };

  const idiomaMap = {
    "Português (Brasil)": "pt-BR",
    "Portugues (Brasil)": "pt-BR",
    "pt-BR": "pt-BR",
    "English (US)": "en-US",
    "en-US": "en-US",
    Español: "es-ES",
    Espanol: "es-ES",
    "es-ES": "es-ES",
  };

  const fusoMap = {
    "São Paulo (GMT-3)": "America/Sao_Paulo",
    "Sao Paulo (GMT-3)": "America/Sao_Paulo",
    "America/Sao_Paulo": "America/Sao_Paulo",
    "New York (GMT-5)": "America/New_York",
    "America/New_York": "America/New_York",
    "London (GMT+0)": "Europe/London",
    "Europe/London": "Europe/London",
  };

  const horaMap = {
    "12 horas": "12",
    "12 hours": "12",
    12: "12",
    "24 horas": "24",
    "24 hours": "24",
    24: "24",
  };

  const semanaMap = {
    Domingo: "sunday",
    Sunday: "sunday",
    Domingo: "sunday",
    sunday: "sunday",
    "Segunda-feira": "monday",
    Segunda: "monday",
    Monday: "monday",
    Lunes: "monday",
    monday: "monday",
  };

  const labels = {
    "pt-BR": {
      idiomas: {
        "pt-BR": "Português (Brasil)",
        "en-US": "English (US)",
        "es-ES": "Español",
      },
      fusos: {
        "America/Sao_Paulo": "São Paulo (GMT-3)",
        "America/New_York": "New York (GMT-5)",
        "Europe/London": "London (GMT+0)",
      },
      horas: { 12: "12 horas", 24: "24 horas" },
      semana: { sunday: "Domingo", monday: "Segunda-feira" },
      weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
      weekdaysMedium: ["Dom.", "Seg.", "Ter.", "Qua.", "Qui", "Sex.", "Sáb."],
      weekdaysFull: [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
      ],
      weekdaysLong: [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
      ],
      months: [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ],
    },
    "en-US": {
      idiomas: {
        "pt-BR": "Portuguese (Brazil)",
        "en-US": "English (US)",
        "es-ES": "Spanish",
      },
      fusos: {
        "America/Sao_Paulo": "São Paulo (GMT-3)",
        "America/New_York": "New York (GMT-5)",
        "Europe/London": "London (GMT+0)",
      },
      horas: { 12: "12 hours", 24: "24 hours" },
      semana: { sunday: "Sunday", monday: "Monday" },
      weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      weekdaysMedium: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      weekdaysFull: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      weekdaysLong: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    "es-ES": {
      idiomas: {
        "pt-BR": "Portugués (Brasil)",
        "en-US": "Inglés (EE. UU.)",
        "es-ES": "Español",
      },
      fusos: {
        "America/Sao_Paulo": "São Paulo (GMT-3)",
        "America/New_York": "Nueva York (GMT-5)",
        "Europe/London": "Londres (GMT+0)",
      },
      horas: { 12: "12 horas", 24: "24 horas" },
      semana: { sunday: "Domingo", monday: "Lunes" },
      weekdaysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      weekdaysMedium: ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."],
      weekdaysFull: [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ],
      weekdaysLong: [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ],
      months: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ],
    },
  };

  const dictionary = {
    "en-US": {
      "Bem-vindo": "Welcome",
      "Faça login para acessar suas anotações": "Log in to access your notes",
      Senha: "Password",
      "Lembrar-me": "Remember me",
      "Esqueceu a senha?": "Forgot password?",
      Entrar: "Sign in",
      "Não tem uma conta?": "Don't have an account?",
      "Cadastre-se": "Sign up",
      "Organize suas ideias de forma simples e tranquila":
        "Organize your ideas in a simple, calm way",
      "Criar conta": "Create account",
      "Preencha os dados para criar sua conta":
        "Fill in the details to create your account",
      "Continuar com Google": "Continue with Google",
      "Continuar com Apple": "Continue with Apple",
      "ou cadastre-se com email": "or sign up with email",
      Nome: "Name",
      "Confirmar senha": "Confirm password",
      Cadastrar: "Create account",
      "Já tem uma conta?": "Already have an account?",
      "Fazer login": "Log in",
      "Minhas Rotinas": "My Routines",
      "+ Nova Rotina": "+ New Routine",
      "+ Adicionar tarefa": "+ Add task",
      "Editar Tabela": "Edit Table",
      "Excluir Rotina": "Delete Routine",
      "Selecione uma rotina": "Select a routine",
      Notas: "Notes",
      Tarefa: "Task",
      Tipo: "Type",
      Status: "Status",
      Disciplina: "Subject",
      Horário: "Time",
      Notificação: "Notification",
      Ações: "Actions",
      "Nenhuma rotina selecionada.": "No routine selected.",
      "Adicionar Evento": "Add Event",
      "Título do evento": "Event title",
      Data: "Date",
      Único: "Single",
      Permanente: "Permanent",
      Aniversário: "Birthday",
      Configurações: "Settings",
      "Gerencie suas preferências e configurações da conta":
        "Manage your preferences and account settings",
      Conta: "Account",
      Geral: "General",
      Notificações: "Notifications",
      Privacidade: "Privacy",
      Preferências: "Preferences",
      Backup: "Backup",
      Produtividade: "Productivity",
      Sobre: "About",
      "Configurações gerais do sistema.": "General system settings.",
      "Idioma do site": "Site language",
      "Fuso horário": "Time zone",
      "Formato de hora": "Time format",
      "Dia de início da semana": "First day of the week",
      Voltar: "Back",
      Salvar: "Save",
      Olá: "Hello",
      eventos: "events",
      Calendário: "Calendar",
      Lembretes: "Reminders",
      "Nenhuma tarefa": "No task",
      "Nenhuma tarefa cadastrada nessa rotina.":
        "No tasks registered in this routine.",
      "Nenhum exercício nesse dia.": "No exercise on this day.",
      Descanso: "Rest",
      "Eventos de": "Events for",
      "Nenhum evento nesse dia.": "No events on this day.",
      "Sem horário": "No time",
      "Feriado brasileiro": "Brazilian holiday",
      Lembrete: "Reminder",
      "Evento manual": "Manual event",
      Rotina: "Routine",
      Tarefa: "Task",
      Pendente: "Pending",
      Concluída: "Completed",
      Frequência: "Frequency",
      "Editar informação": "Edit information",
      "Novo valor": "New value",
      "Configurações salvas com sucesso!": "Settings saved successfully!",
      "Erro ao salvar configurações.": "Error saving settings.",
    },
    "es-ES": {
      "Bem-vindo": "Bienvenido",
      "Faça login para acessar suas anotações":
        "Inicia sesión para acceder a tus notas",
      Senha: "Contraseña",
      "Lembrar-me": "Recordarme",
      "Esqueceu a senha?": "¿Olvidaste tu contraseña?",
      Entrar: "Entrar",
      "Não tem uma conta?": "¿No tienes una cuenta?",
      "Cadastre-se": "Regístrate",
      "Organize suas ideias de forma simples e tranquila":
        "Organiza tus ideas de forma simple y tranquila",
      "Criar conta": "Crear cuenta",
      "Preencha os dados para criar sua conta":
        "Completa los datos para crear tu cuenta",
      "Continuar com Google": "Continuar con Google",
      "Continuar com Apple": "Continuar con Apple",
      "ou cadastre-se com email": "o regístrate con email",
      Nome: "Nombre",
      "Confirmar senha": "Confirmar contraseña",
      Cadastrar: "Registrarse",
      "Já tem uma conta?": "¿Ya tienes una cuenta?",
      "Fazer login": "Iniciar sesión",
      "Minhas Rotinas": "Mis Rutinas",
      "+ Nova Rotina": "+ Nueva Rutina",
      "+ Adicionar tarefa": "+ Agregar tarea",
      "Editar Tabela": "Editar Tabla",
      "Excluir Rotina": "Eliminar Rutina",
      "Selecione uma rotina": "Selecciona una rutina",
      Notas: "Notas",
      Tarefa: "Tarea",
      Tipo: "Tipo",
      Status: "Estado",
      Disciplina: "Materia",
      Horário: "Hora",
      Notificação: "Notificación",
      Ações: "Acciones",
      "Nenhuma rotina selecionada.": "Ninguna rutina seleccionada.",
      "Adicionar Evento": "Agregar Evento",
      "Título do evento": "Título del evento",
      Data: "Fecha",
      Único: "Único",
      Permanente: "Permanente",
      Aniversário: "Cumpleaños",
      Configurações: "Configuración",
      "Gerencie suas preferências e configurações da conta":
        "Gestiona tus preferencias y la configuración de la cuenta",
      Conta: "Cuenta",
      Geral: "General",
      Notificações: "Notificaciones",
      Privacidade: "Privacidad",
      Preferências: "Preferencias",
      Backup: "Copia de seguridad",
      Produtividade: "Productividad",
      Sobre: "Acerca de",
      "Configurações gerais do sistema.": "Configuración general del sistema.",
      "Idioma do site": "Idioma del sitio",
      "Fuso horário": "Zona horaria",
      "Formato de hora": "Formato de hora",
      "Dia de início da semana": "Día de inicio de la semana",
      Voltar: "Volver",
      Salvar: "Guardar",
      Olá: "Hola",
      eventos: "eventos",
      Calendário: "Calendario",
      Lembretes: "Recordatorios",
      "Nenhuma tarefa": "Ninguna tarea",
      "Nenhuma tarefa cadastrada nessa rotina.":
        "No hay tareas registradas en esta rutina.",
      "Nenhum exercício nesse dia.": "Ningún ejercicio en este día.",
      Descanso: "Descanso",
      "Eventos de": "Eventos de",
      "Nenhum evento nesse dia.": "No hay eventos en este día.",
      "Sem horário": "Sin hora",
      "Feriado brasileiro": "Feriado brasileño",
      Lembrete: "Recordatorio",
      "Evento manual": "Evento manual",
      Rotina: "Rutina",
      Tarefa: "Tarea",
      Pendente: "Pendiente",
      Concluída: "Completada",
      Frequência: "Frecuencia",
      "Editar informação": "Editar información",
      "Novo valor": "Nuevo valor",
      "Configurações salvas com sucesso!":
        "Configuración guardada correctamente.",
      "Erro ao salvar configurações.": "Error al guardar la configuración.",
    },
  };

  function normalize(config = {}) {
    return {
      ...config,
      idioma: idiomaMap[config.idioma] || config.idioma || defaults.idioma,
      fuso_horario:
        fusoMap[config.fuso_horario] ||
        config.fuso_horario ||
        defaults.fuso_horario,
      formato_hora:
        horaMap[config.formato_hora] ||
        config.formato_hora ||
        defaults.formato_hora,
      inicio_semana:
        semanaMap[config.inicio_semana] ||
        config.inicio_semana ||
        defaults.inicio_semana,
    };
  }

  function loadLocal() {
    try {
      return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
    } catch {
      return { ...defaults };
    }
  }

  function saveLocal(config) {
    const normalized = normalize(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function current() {
    return loadLocal();
  }

  function locale() {
    return current().idioma || defaults.idioma;
  }

  function canonicalText(text) {
    const value = String(text);
    for (const translations of Object.values(dictionary)) {
      for (const [pt, translated] of Object.entries(translations)) {
        if (value === translated) return pt;
      }
    }
    return value;
  }

  function t(text) {
    if (text == null) return "";
    const value = canonicalText(text);
    return dictionary[locale()]?.[value] || value;
  }

  function getLabels() {
    return labels[locale()] || labels["pt-BR"];
  }

  function weekStartIndex() {
    return current().inicio_semana === "sunday" ? 0 : 1;
  }

  function orderWeekValues(values) {
    const start = weekStartIndex();
    return [...values].sort(
      (a, b) => ((a - start + 7) % 7) - ((b - start + 7) % 7),
    );
  }

  function weekDays(style = "short") {
    const table = getLabels()[style] || getLabels().weekdaysShort;
    return orderWeekValues([0, 1, 2, 3, 4, 5, 6]).map((index) => ({
      index,
      label: table[index],
    }));
  }

  function datePartsInZone(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: current().fuso_horario,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);

    return Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );
  }

  function todayISO() {
    const parts = datePartsInZone(new Date());
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function formatDateISO(date) {
    if (!(date instanceof Date)) return "";
    const parts = datePartsInZone(date);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function formatDisplayDateISO(dataISO) {
    if (!dataISO || !dataISO.includes("-")) return dataISO || "";
    const [year, month, day] = dataISO.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return new Intl.DateTimeFormat(locale(), {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function formatTime(time) {
    if (!time || !time.includes(":")) return time || "";
    const [hour, minute] = time.split(":").map(Number);
    const date = new Date(Date.UTC(2026, 0, 1, hour || 0, minute || 0, 0));
    return new Intl.DateTimeFormat(locale(), {
      timeZone: "UTC",
      hour: "numeric",
      minute: "2-digit",
      hour12: current().formato_hora !== "24",
    }).format(date);
  }

  function zonedDateFromISOTime(dataISO, time = "09:00") {
    if (!dataISO || !dataISO.includes("-")) return null;

    const [year, month, day] = dataISO.split("-").map(Number);
    const [hour, minute] = String(time || "09:00")
      .split(":")
      .map(Number);
    const utcMs = Date.UTC(year, month - 1, day, hour || 0, minute || 0, 0);

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: current().fuso_horario,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date(utcMs));

    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );
    const zonedAsUTC = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    );
    const offsetMs = zonedAsUTC - utcMs;

    return new Date(utcMs - offsetMs);
  }

  function minutesUntilTime(time) {
    if (!time || !time.includes(":")) return null;
    const alvo = zonedDateFromISOTime(todayISO(), time);
    return alvo ? (alvo.getTime() - Date.now()) / 60000 : null;
  }

  function setOptions(select, options) {
    if (!select) return;
    const value = select.value;
    select.innerHTML = options
      .map(
        (option) => `<option value="${option.value}">${option.label}</option>`,
      )
      .join("");
    if (options.some((option) => option.value === value)) select.value = value;
  }

  function applySelectLabels(root = document) {
    const table = getLabels();
    setOptions(
      root.getElementById?.("idioma") || document.getElementById("idioma"),
      [
        { value: "pt-BR", label: table.idiomas["pt-BR"] },
        { value: "en-US", label: table.idiomas["en-US"] },
        { value: "es-ES", label: table.idiomas["es-ES"] },
      ],
    );
    setOptions(
      root.getElementById?.("fusoHorario") ||
        document.getElementById("fusoHorario"),
      [
        { value: "America/Sao_Paulo", label: table.fusos["America/Sao_Paulo"] },
        { value: "America/New_York", label: table.fusos["America/New_York"] },
        { value: "Europe/London", label: table.fusos["Europe/London"] },
      ],
    );
    setOptions(
      root.getElementById?.("formatoHora") ||
        document.getElementById("formatoHora"),
      [
        { value: "12", label: table.horas["12"] },
        { value: "24", label: table.horas["24"] },
      ],
    );
    setOptions(
      root.getElementById?.("inicioSemana") ||
        document.getElementById("inicioSemana"),
      [
        { value: "monday", label: table.semana.monday },
        { value: "sunday", label: table.semana.sunday },
      ],
    );
  }

  function translateDOM(root = document) {
    document.documentElement.lang = locale();
    applySelectLabels(root);

    const walker = document.createTreeWalker(
      root.body || root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (
            ["SCRIPT", "STYLE", "OPTION"].includes(node.parentElement?.tagName)
          )
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const original = node.nodeValue.trim();
      const translated = t(original);
      if (translated !== original) {
        node.nodeValue = node.nodeValue.replace(original, translated);
      }
    });

    root
      .querySelectorAll?.("[placeholder], [title], [aria-label]")
      .forEach((element) => {
        ["placeholder", "title", "aria-label"].forEach((attr) => {
          const value = element.getAttribute(attr);
          if (!value) return;
          const translated = t(value);
          if (translated !== value) element.setAttribute(attr, translated);
        });
      });
  }

  window.MyNotePrefs = {
    defaults,
    normalize,
    loadLocal,
    saveLocal,
    current,
    locale,
    labels: getLabels,
    t,
    translateDOM,
    applySelectLabels,
    weekStartIndex,
    weekDays,
    orderWeekValues,
    todayISO,
    formatDateISO,
    formatDisplayDateISO,
    formatTime,
    zonedDateFromISOTime,
    minutesUntilTime,
  };

  document.addEventListener("DOMContentLoaded", () => translateDOM(document));
})();
