/** Deliberately static anatomical illustration for unavailable WebGL / reduced motion. */
export default function BrainFallback() {
  return (
    <div className="brain-fallback" data-brain-fallback aria-hidden="true">
      <svg viewBox="0 0 400 360" fill="none">
        <defs>
          <linearGradient id="brain-fallback-light" x1="65" y1="60" x2="320" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#bdeff7" /><stop offset=".55" stopColor="#49c2dc" /><stop offset="1" stopColor="#929ee7" />
          </linearGradient>
        </defs>
        <g stroke="url(#brain-fallback-light)" strokeWidth="1.4" strokeLinecap="round">
          <path d="M196 70C166 36 122 51 112 76C73 76 48 107 59 139C34 169 50 201 71 210C65 244 99 263 125 259C136 284 171 281 194 256M204 70C234 36 278 51 288 76C327 76 352 107 341 139C366 169 350 201 329 210C335 244 301 263 275 259C264 284 229 281 206 256" />
          <path d="M196 70C187 121 202 162 194 256L186 308L207 314L212 267M204 70C213 121 198 162 206 256" />
          <path d="M113 77C105 105 139 100 141 121S111 147 105 128M62 139C91 129 96 160 82 174S72 197 91 211M124 259C127 235 145 241 159 231S169 199 145 197S116 181 129 165M176 83C148 74 135 88 148 101M173 131C152 119 160 150 144 158M173 173C185 183 173 198 178 215M287 77C295 105 261 100 259 121S289 147 295 128M338 139C309 129 304 160 318 174S328 197 309 211M276 259C273 235 255 241 241 231S231 199 255 197S284 181 271 165M224 83C252 74 265 88 252 101M227 131C248 119 240 150 256 158M227 173C215 183 227 198 222 215" opacity=".65" />
          <path d="M84 108L144 158L91 211L159 231L176 83M316 108L256 158L309 211L241 231L224 83" strokeDasharray="2 7" opacity=".35" />
        </g>
      </svg>
    </div>
  );
}
