
import React, { useState, useCallback, ChangeEvent } from 'react';
import { UiState, Mode, ImageFile } from './types';
import { fileToBase64, createThumbnail } from './utils/imageUtils';
import { generateImageWithGemini } from './services/geminiService';
import Sparkles from './components/Sparkles';
import Spinner from './components/Spinner';
import Glow from './components/Glow';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [mode, setMode] = useState<Mode>(Mode.CREATE);
  const [activeFn, setActiveFn] = useState<string>('prompt');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageUpload, setImageUpload] = useState<ImageFile | null>(null);
  const [compose1, setCompose1] = useState<ImageFile | null>(null);
  const [compose2, setCompose2] = useState<ImageFile | null>(null);
  const [createThumb, setCreateThumb] = useState<boolean>(false);
  
  const [uiState, setUiState] = useState<UiState>(UiState.IDLE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<ImageFile | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({ file, preview: URL.createObjectURL(file) });
    } else {
      setter(null);
    }
  };

  const resetUI = useCallback(() => {
    setPrompt('');
    setImageUrl('');
    setImageUpload(null);
    setCompose1(null);
    setCompose2(null);
    setGeneratedImage(null);
    setUiState(UiState.IDLE);
    // Reset file input fields
    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach(input => (input as HTMLInputElement).value = '');
  }, []);

  const downloadImage = useCallback(() => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = 'inwise-gemini-image.png';
    a.click();
    URL.revokeObjectURL(generatedImage);
  }, [generatedImage]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Por favor, descreva sua ideia no campo de prompt.');
      return;
    }
    setUiState(UiState.LOADING);
    setGeneratedImage(null);

    try {
      const imageParts: { data: string; mimeType: string }[] = [];

      if (compose1 && compose2) {
        const [b64_1, b64_2] = await Promise.all([
            fileToBase64(compose1.file),
            fileToBase64(compose2.file)
        ]);
        imageParts.push({ data: b64_1, mimeType: compose1.file.type });
        imageParts.push({ data: b64_2, mimeType: compose2.file.type });
      } else if (imageUpload) {
        const b64 = await fileToBase64(imageUpload.file);
        imageParts.push({ data: b64, mimeType: imageUpload.file.type });
      }
      
      let finalPrompt = prompt;
      if (activeFn !== 'prompt') {
        finalPrompt = `${activeFn} style, ${prompt}`;
      }

      let resultUrl = await generateImageWithGemini(finalPrompt, imageParts);

      if (createThumb) {
        resultUrl = await createThumbnail(resultUrl);
      }

      setGeneratedImage(resultUrl);
      setUiState(UiState.SHOW);
    } catch (error) {
      const err = error as Error;
      alert(`Erro: ${err.message}`);
      setUiState(UiState.IDLE);
    }
  };
  
  const renderUploadBox = (id: string, file: ImageFile | null, setter: React.Dispatch<React.SetStateAction<ImageFile | null>>, label: string) => (
    <Glow as="label" className="block relative p-4 text-center border border-dashed border-[var(--brand-weak)] bg-[rgba(0,207,255,.05)] rounded-[var(--r-md)] cursor-pointer hover:bg-[rgba(0,207,255,.08)]">
      {label}
      <input id={id} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, setter)} />
      {file && <img src={file.preview} className="block max-w-full rounded-[10px] mt-2.5 border border-[var(--border)]" alt="Preview"/>}
    </Glow>
  );

  return (
    <>
      <Sparkles />
      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-9">
        <header className="text-center mb-6">
          <h1 className="font-black text-4xl md:text-5xl bg-gradient-to-r from-[var(--brand)] to-[#69e6ff] bg-clip-text text-transparent">INWISE STUDIO</h1>
          <p className="text-[var(--muted)]">Gerador de Imagens Profissional com <b>Gemini</b></p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5">
          {/* Left Panel */}
          <Glow className="bg-gradient-to-b from-[rgba(255,255,255,.05)] to-[rgba(255,255,255,.025)] border border-[var(--border)] rounded-[var(--r-lg)] p-5 space-y-4">
            <div>
              <div className="text-xl font-extrabold text-[#c9f6ff]">Painel de Controle</div>
              <div className="text-[var(--muted)]">Crie ou edite imagens com o <b>Gemini</b></div>
            </div>
            
            <div>
              <div className="section-title">Qual a sua ideia:</div>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full text-[var(--text)] bg-[rgba(255,255,255,.06)] border border-[var(--border)] rounded-[var(--r-md)] p-3 min-h-[110px] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--brand-weak)]" placeholder="Descreva sua ideia..."></textarea>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setMode(Mode.CREATE)} className={`flex-1 p-2.5 uppercase rounded-[var(--r-md)] border border-[var(--border)] bg-[rgba(255,255,255,.05)] transition-all ${mode === Mode.CREATE ? 'border-[var(--brand-weak)] shadow-[0_0_0_2px_rgba(0,207,255,.14)_inset]' : ''}`}>Criar</button>
              <button onClick={() => setMode(Mode.EDIT)} className={`flex-1 p-2.5 uppercase rounded-[var(--r-md)] border border-[var(--border)] bg-[rgba(255,255,255,.05)] transition-all ${mode === Mode.EDIT ? 'border-[var(--brand-weak)] shadow-[0_0_0_2px_rgba(0,207,255,.14)_inset]' : ''}`}>Editar</button>
            </div>

            <div>
              <div className="section-title">Funções (opcionais)</div>
              <div className="grid grid-cols-2 gap-2.5">
                {['prompt', 'sticker', 'logo', 'comic'].map(fn => (
                  <Glow as="button" key={fn} onClick={() => setActiveFn(fn)} className={`p-2.5 text-center capitalize rounded-[var(--r-md)] border border-[var(--border)] bg-[rgba(255,255,255,.05)] transition-all ${activeFn === fn ? 'border-[var(--brand-weak)]' : ''}`}>{fn}</Glow>
                ))}
              </div>
            </div>

            <div>
              <div className="section-title">Image-to-Image (upload local)</div>
              {renderUploadBox('imageUpload', imageUpload, setImageUpload, 'Clique ou solte uma imagem (JPG/PNG/WebP)')}
            </div>

            <div>
              <div className="section-title">Compose (mesclar duas imagens)</div>
              <div className="grid grid-cols-2 gap-2.5">
                {renderUploadBox('imageUpload1', compose1, setCompose1, 'Primeira imagem')}
                {renderUploadBox('imageUpload2', compose2, setCompose2, 'Segunda imagem')}
              </div>
              <div className="text-xs text-[var(--muted)] mt-1.5">O Gemini combinará as duas imagens com seu prompt.</div>
            </div>
            
            <Glow as="label" className="flex gap-2.5 items-center mt-2.5 p-2.5 border border-[var(--border)] rounded-[var(--r-md)] bg-[rgba(255,255,255,.05)] cursor-pointer">
              <input type="checkbox" checked={createThumb} onChange={(e) => setCreateThumb(e.target.checked)} className="transform scale-110" />
              <span>Criar thumb 1024×1024 (crop central)</span>
            </Glow>

            <Glow as="button" onClick={handleGenerate} disabled={uiState === UiState.LOADING} className="w-full flex items-center justify-center p-3 mt-3 border border-[var(--brand-weak)] bg-[radial-gradient(120%_120%_at_50%_0%,_rgba(0,207,255,.22),_rgba(0,207,255,.07)_55%,_rgba(0,207,255,.04)_100%)] font-bold tracking-wider rounded-[var(--r-md)] shadow-[0_8px_26px_rgba(0,207,255,.12),0_0_0_1px_rgba(0,207,255,.10)_inset] disabled:opacity-50 disabled:cursor-not-allowed">
              {uiState === UiState.LOADING ? <Spinner className="mr-2" /> : null}
              <span>GERAR IMAGEM</span>
            </Glow>
          </Glow>

          {/* Right Panel */}
          <Glow className="relative bg-gradient-to-b from-[rgba(255,255,255,.05)] to-[rgba(255,255,255,.025)] border border-[var(--border)] rounded-[var(--r-lg)] p-5 min-h-[400px] flex items-center justify-center">
            {uiState === UiState.IDLE && (
              <div className="text-center p-10 border border-dashed border-[var(--brand-weak)] rounded-[var(--r-lg)] bg-[rgba(0,207,255,.03)] text-[var(--muted)]">
                Sua arte aparecerá aqui
              </div>
            )}
            {uiState === UiState.LOADING && (
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Spinner />
                <div>Gerando imagem...</div>
              </div>
            )}
            {uiState === UiState.SHOW && generatedImage && (
              <div className="w-full">
                <img src={generatedImage} alt="Generated Art" className="max-w-full max-h-[70vh] object-contain mx-auto rounded-[var(--r-md)] border border-[var(--border)]" />
                <div className="flex gap-2.5 mt-2.5">
                  <Glow as="button" onClick={downloadImage} className="flex-1 p-2.5 rounded-[var(--r-md)] border border-[var(--border)] bg-[rgba(255,255,255,.05)]">Download</Glow>
                  <Glow as="button" onClick={resetUI} className="flex-1 p-2.5 rounded-[var(--r-md)] border border-[var(--border)] bg-[rgba(255,255,255,.05)]">Nova</Glow>
                </div>
              </div>
            )}
          </Glow>
        </div>

        <footer className="text-xs text-[var(--muted)] text-center mt-4">© 2025 — INWISE</footer>
      </div>
    </>
  );
};

export default App;
