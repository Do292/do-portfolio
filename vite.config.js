import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import dns from "dns";
// import eslintPlugin  from  'vite-plugin-eslint';

dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
// https://vitejs.dev/config/server-options.html
export default defineConfig(({ command, mode }) => {
	console.log("command : ", command, ", mode : ", mode);
	// 현재 작업 디렉터리의 `mode`를 기반으로 env 파일을 불러옴
	// 세 번째 매개변수를 ''로 설정하면 `VITE_` 접두사에 관계없이 모든 환경 변수를 불러옴
	const env = loadEnv(mode, process.cwd(), "");
	return {
		define: {
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
		},
		plugins: [
			vue(),
			// eslintPlugin({
			// 	include: [ 'src/**/*.js',  'src/**/*.vue',  'src/*.js',  'src/*.vue'],
			// })
		],
		// css: {
		// 	preprocessorOptions: {
		// 		scss: {
		// 			includePaths: ["node_modules/@syncfusion"],
		// 		},
		// 	},
		// },
		server: {
			host: "localhost",
			port: 3001,
			strictPort: true,
			open: "/",
			proxy: {
				//api로 시작하는 path는 target에 정의한 서버를 호출한다.
				// "" 하는 경우 모든 path에 대해서, target을 바라보게 된다.
				//api 호출 해야 되는 경우, 아래와 같이 prefix를 정하여 사용하자.
				"/api/modeler": {
					target: env.MODELER_API_SERVER_URL,
					// 실제 서버의 API의 path 가 /api로 시작하지 않는 경우 rewrite로 path를 변경한다. rewrite를 사용하는 경우.
					// 주의  : Chrome 개발자 도구에는 / api 로 찍힌다.
					// 실제로 호출되는 / api가 제거된 url이 호출된다.
					rewrite: path => {
						return path.replace("/api", "/mes");
					},
				},
				"/api/spc": {
					target: env.SPC_API_SERVER_URL,
					rewrite: path => {
						return path.replace("/api", "");
					},
				},
				"/api/mes": {
					target: env.MES_API_SERVER_URL,
					rewrite: path => {
						return path.replace("/api", "");
					},
				},
				"/api/qms": {
					target: env.QMS_API_SERVER_URL,
					rewrite: path => {
						return path.replace("/api", "");
					},
				},
			},
		},
		resolve: {
			alias: {
				// ../../ 이런식으로 사용하지 말고 원하는 별칭을 주어서 사용하자.
				"~": fileURLToPath(new URL("./src", import.meta.url)),
				"#": fileURLToPath(new URL("./src/system", import.meta.url)),
			},
			extensions: [".js", ".vue"], //해당 확장자는 표현시에 생략가능 하다.
		},
		build: {
			//최소화
			minify: "terser",
			terserOptions: {
				//압축, console 삭제( true ), 유지( false )
				compress: {
					drop_console: false,
					drop_debugger: false,
				},
			},
			chunkSizeWarningLimit: 1000,
			rollupOptions: {
				output: {
					manualChunks(id) {
						//파일 사이즈가 커져서 vender 별로 파일을 분리함.
						if (id.includes("node_modules")) {
							return id
								.toString()
								.split("node_modules/")[1]
								.split("/")[0]
								.toString();
						}
					},
				},
			},
		},
	};
});
