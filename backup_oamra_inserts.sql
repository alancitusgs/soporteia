--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: configuracion_sistema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion_sistema (
    id integer NOT NULL,
    mensaje_bienvenida text NOT NULL,
    temperatura character varying(20) NOT NULL,
    max_tokens integer NOT NULL,
    auto_reindexacion boolean NOT NULL,
    notificaciones_email boolean NOT NULL,
    notificaciones_slack boolean NOT NULL,
    umbral_alertas integer NOT NULL,
    fecha_actualizacion timestamp without time zone
);


ALTER TABLE public.configuracion_sistema OWNER TO postgres;

--
-- Name: interacciones_tano; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interacciones_tano (
    id integer NOT NULL,
    pregunta_usuario text NOT NULL,
    respuesta_tano text NOT NULL,
    es_no_contestada boolean NOT NULL,
    fuentes jsonb,
    fecha timestamp without time zone NOT NULL,
    session_id character varying(100),
    tiempo_respuesta_ms integer
);


ALTER TABLE public.interacciones_tano OWNER TO postgres;

--
-- Name: interacciones_tano_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interacciones_tano_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interacciones_tano_id_seq OWNER TO postgres;

--
-- Name: interacciones_tano_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interacciones_tano_id_seq OWNED BY public.interacciones_tano.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    rol character varying(20) NOT NULL,
    activo boolean NOT NULL,
    fecha_creacion timestamp without time zone NOT NULL,
    ultimo_login timestamp without time zone
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: interacciones_tano id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interacciones_tano ALTER COLUMN id SET DEFAULT nextval('public.interacciones_tano_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: configuracion_sistema; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: interacciones_tano; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.interacciones_tano VALUES (1, 'Con que navegador ingreso?', 'Puedes ingresar con cualquier navegador. Si la plataforma no carga, asegúrate de haber borrado el caché de tu navegador o ingresar desde el modo incógnito.
', false, '[{"uri": "gs://heredia-documentos-matricula/Q&A_Chatbot portal de matrícula 2026.pdf", "title": "Q&A_Chatbot portal de matrícula 2026"}]', '2025-12-28 07:08:16.829637', NULL, NULL);
INSERT INTO public.interacciones_tano VALUES (2, 'No puedo ingresar a la plataforma', 'Si no puedes ingresar a la plataforma, asegúrate de haber borrado el caché de tu navegador o ingresar desde el modo incógnito. Puedes usar cualquier navegador para matricularte. Si tienes problemas para ingresar a clases, subir tareas, comunicarte con docentes y revisar grabaciones, puedes usar el Aula virtual Blackboard. El enlace es: https://upch.blackboard.com. Si tienes problemas con las notificaciones de Blackboard, contacta a Soporte Virtual escribiendo a upchvirtual@upch.pe.

Si te refieres al portal de matrícula y tu estado de matrícula no se actualiza, después de completar el proceso de matrícula, es necesario ingresar al botón “Validar pago”. Si realizas el pago a través de banca, este puede tardar aproximadamente 1 hora en procesarse. Si lo realizas un fin de semana, deberás esperar el día hábil para validarlo. De lo contrario, puedes consultar con DAEF daef.pensiones@oficinas-upch.pe los tiempos de procesamiento de pagos. Tu pago puede demorar en reflejarse hasta 48 horas en el sistema. Si después de ese tiempo no se muestra como procesado o tienes alguna incidencia financiera, puedes comunicarte con la Dirección Administrativa de Economía y Finanzas (DAEF), a través del siguiente correo electrónico: daef.pensiones@oficinas-upch.pe.

La Universidad Peruana Cayetano Heredia (UPCH) ofrece varios servicios virtuales para estudiantes, incluyendo el Aula virtual Blackboard, el Portal de matrícula (https://portalmatricula.cayetano.pe/auth) y la Intranet (https://intranet.upch.edu.pe). También ofrece una Mesa de Partes Virtual y soporte a través de WhatsApp 941 388 876 (opción “Oficina de Matrícula”).

Para consultar las fechas de matrícula, debes verificar el Calendario Académico 2026.
', false, '[{"uri": "gs://heredia-documentos-matricula/Q&A_Chatbot portal de matrícula 2026.pdf", "title": "Q&A_Chatbot portal de matrícula 2026"}]', '2025-12-31 08:42:32.186166', NULL, 4179);
INSERT INTO public.interacciones_tano VALUES (3, 'como separo un laboratorio', 'No encontré información específica sobre eso. ¿Podrías reformular tu pregunta o ser más específico?', true, 'null', '2025-12-31 08:44:39.941014', NULL, 2919);
INSERT INTO public.interacciones_tano VALUES (4, 'con que navegador ingreso', 'Puedes usar cualquier navegador para matricularte. Si la plataforma no carga, asegúrate de haber borrado el caché de tu navegador o ingresar desde el modo incógnito.
', false, '[{"uri": "gs://heredia-documentos-matricula/Q&A_Chatbot portal de matrícula 2026.pdf", "title": "Q&A_Chatbot portal de matrícula 2026"}]', '2025-12-31 08:48:51.596139', NULL, 2472);
INSERT INTO public.interacciones_tano VALUES (5, 'como separo un laboratorio', 'No encontré información específica sobre eso. ¿Podrías reformular tu pregunta o ser más específico?', true, 'null', '2025-12-31 08:49:53.091461', NULL, 4146);
INSERT INTO public.interacciones_tano VALUES (6, 'no puedo entrar a mi plataforma', 'No encontré información específica sobre eso. ¿Podrías reformular tu pregunta o ser más específico?', true, 'null', '2025-12-31 16:51:37.918698', NULL, 3213);
INSERT INTO public.interacciones_tano VALUES (7, '¿Qué hago si la plataforma no carga?', 'Si la plataforma no carga, asegúrate de haber borrado el caché de tu navegador o ingresar desde el modo incógnito. Los problemas con la plataforma virtual o intranet son un tema común.
', false, '[{"uri": "gs://heredia-documentos-matricula/Q&A_Chatbot portal de matrícula 2026.pdf", "title": "Q&A_Chatbot portal de matrícula 2026"}]', '2025-12-31 16:52:02.10473', NULL, 1864);
INSERT INTO public.interacciones_tano VALUES (8, '¿Qué hago si la plataforma no carga?', 'Si la plataforma no carga, asegúrate de haber borrado el caché de tu navegador o ingresar desde el modo incógnito. Los problemas con la plataforma virtual o intranet son un tema común.
', false, '[{"uri": "gs://heredia-documentos-matricula/Q&A_Chatbot portal de matrícula 2026.pdf", "title": "Q&A_Chatbot portal de matrícula 2026"}]', '2025-12-31 16:53:36.762341', NULL, 2018);


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios VALUES (1, 'Administrador OAMRA', 'admin@oamra.upch.edu.pe', '$2b$12$pzStUmud4mNDh0zNn45qNeKJSLRCVS2eV0AKYF5qr1K8m75jiXf4y', 'admin', true, '2025-12-30 08:41:29.779473', '2025-12-31 19:29:51.490174');
INSERT INTO public.usuarios VALUES (2, 'Oamra Reporte', 'reportes@upch.pe', '$2b$12$SiPPJtz9nrxeLNIIa687F.4ZxD/tsAbMa9i8TLYwgzvJ0Q0sXokJG', 'reportes', true, '2025-12-31 20:59:10.95073', NULL);
INSERT INTO public.usuarios VALUES (3, 'Tester', 'tester@gmail.com', '$2b$12$V5PsjrefpLXj2nt1poWBIeqXPm3f7cRGYkiz5vEKJD.cUl2hnIElO', 'reportes', true, '2026-01-01 01:29:15.632765', NULL);


--
-- Name: interacciones_tano_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interacciones_tano_id_seq', 8, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 3, true);


--
-- Name: configuracion_sistema configuracion_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (id);


--
-- Name: interacciones_tano interacciones_tano_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interacciones_tano
    ADD CONSTRAINT interacciones_tano_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: ix_interacciones_tano_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_interacciones_tano_id ON public.interacciones_tano USING btree (id);


--
-- Name: ix_usuarios_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: ix_usuarios_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_usuarios_id ON public.usuarios USING btree (id);


--
-- PostgreSQL database dump complete
--

