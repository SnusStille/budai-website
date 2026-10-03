# Öppna i VS Code / Open in VS Code

## Svenska

1. Packa upp zip-filen.
2. I VS Code: **File → Open Folder…** och välj mappen `budai-preview`.
3. Öppna terminalen (`Ctrl+ö` / `` Ctrl+` ``).
4. Kör:

```bash
npm install
cp .env.example .env.local
npm run dev
```

5. Öppna http://localhost:3000  
   Produkten: http://localhost:3000/playground

API-nycklar är valfria. Utan `ANTHROPIC_API_KEY` går Playground att öppna men svarar med ett offlinemeddelande.

## English

1. Unzip.
2. VS Code: **File → Open Folder…** → `budai-preview`.
3. Terminal (`Ctrl+`` `).
4. Run the commands above.
5. Open http://localhost:3000
