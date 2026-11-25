# Teleprompter AgroSyntese

Teleprompter que acompanha a voz e funciona sem internet (app instalável).

- Os roteiros ficam em `roteiros.dat`, cifrados. Só abrem com a senha.
- Reconhecimento de voz no próprio aparelho: [Vosk](https://alphacephei.com/vosk/) via [vosk-browser](https://github.com/ccoreilly/vosk-browser) (Apache-2.0), com o modelo `vosk-model-small-pt-0.3` (Apache-2.0).
- `modelo/vosk-pt-small-0.3-rapido.tar.gz` é o mesmo modelo reorganizado no formato novo do Vosk, com `conf/model.conf` de busca mais enxuta (`--beam=8 --max-active=2000 --lattice-beam=2`) para rodar folgado em tablet. O `vosk-pt-small-0.3.tar.gz` original fica de reserva.
