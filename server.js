import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

// Configuração do multer para salvar as imagens
const upload = multer({
  dest: 'uploads/', // Diretório onde as imagens serão armazenadas
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Apenas imagens JPG, JPEG e PNG são permitidas.'));
    }
    cb(null, true);
  },
});
const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve as imagens estáticas

// Endpoint POST para adicionar produtos com foto
app.post('/produtos', upload.single('foto'), async (req, res) => {
  try {
    const { nome, descricao, quantidade } = req.body;

    // Converte a quantidade para inteiro
    const quantidadeInt = parseInt(quantidade, 10);

    // Verifica se a conversão foi bem-sucedida
    if (isNaN(quantidadeInt)) {
      return res.status(400).json({ error: 'Quantidade deve ser um número válido.' });
    }

    const foto = req.file ? req.file.path : null; // Salva o caminho do arquivo, se existir

    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        quantidade: quantidadeInt, // Passa o número inteiro
        foto, // Adiciona o caminho da foto no banco de dados
      },
    });

    res.status(201).json({ message: 'Produto criado com sucesso!', produto: novoProduto });
  } catch (error) {
    console.error('Erro ao criar produto:', error);  // Exibe o erro completo no console
    res.status(500).json({ error: 'Erro ao criar produto', message: error.message });
  }
});



// Endpoint GET para listar produtos, incluindo foto
app.get('/produtos', async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany();
    res.status(200).json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar produtos.' });
  }
});


// Endpoint PUT para atualizar um produto com foto
app.put('/produtos/:id', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;  // id já é uma string
    const { nome, descricao, quantidade } = req.body;
    const foto = req.file ? req.file.path : null;

    const produtoAtualizado = await prisma.produto.update({
      where: {
        id: id,  // Use diretamente o id como string
      },
      data: {
        nome,
        descricao,
        quantidade,
        foto,
      },
    });

    res.status(200).json({ message: 'Produto atualizado com sucesso!', produto: produtoAtualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

// Endpoint DELETE para deletar um produto
app.delete('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;  // id já é uma string

    const produtoDeletado = await prisma.produto.delete({
      where: {
        id: id,  // Use diretamente o id como string
      },
    });

    res.status(200).json({ message: 'Produto deletado com sucesso!', produto: produtoDeletado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar produto.' });
  }
});


// Inicializa o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
