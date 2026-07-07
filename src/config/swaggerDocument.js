export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Blog Multiutente API',
        version: '1.0.0',
        description: 'API REST per la gestione di un blog multiutente con autenticazione JWT, post, tag, commenti e like.'
    },
    servers: [
        { url: 'http://localhost:8003', description: 'Server locale' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    avatar: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'active'] }
                }
            },
            Post: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    author: { $ref: '#/components/schemas/User' },
                    image: { type: 'string', nullable: true },
                    tags: { type: 'array', items: { type: 'string' } },
                    publishedAt: { type: 'string', format: 'date-time' },
                    likesCount: { type: 'integer' },
                    commentsCount: { type: 'integer' }
                }
            },
            Comment: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    text: { type: 'string' },
                    author: { $ref: '#/components/schemas/User' },
                    post: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        }
    },
    paths: {
        '/user': {
            post: {
                summary: 'Registrazione di un nuovo utente',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                    password: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Utente creato', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    400: { description: 'Dati non validi', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    409: { description: 'Email già registrata', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                }
            }
        },
        '/user/login': {
            post: {
                summary: 'Login utente',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string' },
                                    password: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Login riuscito, ritorna accessToken e refreshToken' },
                    400: { description: 'Dati mancanti' },
                    401: { description: 'Credenziali non valide' }
                }
            }
        },
        '/user/profile': {
            put: {
                summary: 'Modifica profilo utente autenticato',
                tags: ['Auth'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    avatar: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Profilo aggiornato', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    400: { description: 'Dati non validi' },
                    401: { description: 'Non autenticato' }
                }
            }
        },
        '/post': {
            post: {
                summary: 'Crea un nuovo post',
                tags: ['Post'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['title', 'content'],
                                properties: {
                                    title: { type: 'string' },
                                    content: { type: 'string' },
                                    tags: { type: 'array', items: { type: 'string' } },
                                    image: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Post creato', content: { 'application/json': { schema: { $ref: '#/components/schemas/Post' } } } },
                    400: { description: 'Dati non validi' },
                    401: { description: 'Non autenticato' }
                }
            },
            get: {
                summary: 'Lista di tutti i post (accesso pubblico)',
                tags: ['Post'],
                responses: {
                    200: {
                        description: 'Elenco post',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Post' } } } }
                    }
                }
            }
        },
        '/post/{id}': {
            get: {
                summary: 'Dettaglio di un post (accesso pubblico)',
                tags: ['Post'],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Dettaglio post', content: { 'application/json': { schema: { $ref: '#/components/schemas/Post' } } } },
                    400: { description: 'Id non valido' },
                    404: { description: 'Post non trovato' }
                }
            },
            put: {
                summary: 'Modifica un post (solo autore)',
                tags: ['Post'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    content: { type: 'string' },
                                    tags: { type: 'array', items: { type: 'string' } }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Post aggiornato' },
                    401: { description: 'Non autenticato' },
                    403: { description: 'Non sei l\'autore del post' },
                    404: { description: 'Post non trovato' }
                }
            },
            delete: {
                summary: 'Elimina un post (solo autore)',
                tags: ['Post'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Post eliminato' },
                    401: { description: 'Non autenticato' },
                    403: { description: 'Non sei l\'autore del post' },
                    404: { description: 'Post non trovato' }
                }
            }
        },
        '/post/{postId}/comment': {
            post: {
                summary: 'Aggiunge un commento a un post',
                tags: ['Comment'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: { type: 'object', required: ['text'], properties: { text: { type: 'string' } } }
                        }
                    }
                },
                responses: {
                    201: { description: 'Commento creato', content: { 'application/json': { schema: { $ref: '#/components/schemas/Comment' } } } },
                    400: { description: 'Testo mancante' },
                    401: { description: 'Non autenticato' },
                    404: { description: 'Post non trovato' }
                }
            }
        },
        '/comment/{id}': {
            put: {
                summary: 'Modifica un commento (solo autore)',
                tags: ['Comment'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: { type: 'object', required: ['text'], properties: { text: { type: 'string' } } }
                        }
                    }
                },
                responses: {
                    200: { description: 'Commento aggiornato' },
                    401: { description: 'Non autenticato' },
                    403: { description: 'Non sei l\'autore del commento' }
                }
            },
            delete: {
                summary: 'Elimina un commento (solo autore)',
                tags: ['Comment'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Commento eliminato' },
                    401: { description: 'Non autenticato' },
                    403: { description: 'Non sei l\'autore del commento' }
                }
            }
        },
        '/post/{postId}/like': {
            post: {
                summary: 'Mette o toglie un like a un post (toggle)',
                tags: ['Like'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: {
                        description: 'Like aggiunto o rimosso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        liked: { type: 'boolean' },
                                        likesCount: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Non autenticato' },
                    404: { description: 'Post non trovato' }
                }
            }
        }
    }
};