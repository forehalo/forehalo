/**
 * The Expander's source material (napi.md §N2).
 * RAW_CODE is condensed-but-real raw N-API registration boilerplate — exactly
 * 118 lines: `napi_module_register`, `napi_create_function`,
 * `napi_set_named_property`, `napi_get_cb_info`, type-marshalling match arms.
 * 40 lines visible, 78 behind the fold marker.
 */

export const RAW_CODE = `// binding_raw.rs — the N-API ceremony #[napi] writes for you
use std::ffi::CString;
use std::os::raw::{c_char, c_void};
use std::ptr;

use napi_sys::{
  napi_callback_info, napi_create_function, napi_create_int32, napi_env,
  napi_get_cb_info, napi_get_value_int32, napi_module, napi_module_register,
  napi_set_named_property, napi_status, napi_throw_error, napi_throw_type_error,
  napi_value,
};

fn sum(a: i32, b: i32) -> i32 {
  a + b
}

// ── everything below this line is glue you didn't want to write ──

unsafe extern "C" fn sum_js(env: napi_env, info: napi_callback_info) -> napi_value {
  let mut argc: usize = 2;
  let mut args: [napi_value; 2] = [ptr::null_mut(); 2];
  let mut this: napi_value = ptr::null_mut();
  let status = unsafe {
    napi_get_cb_info(env, info, &mut argc, args.as_mut_ptr(), &mut this, ptr::null_mut())
  };
  if status != napi_status::napi_ok {
    napi_throw_error(env, ptr::null(), c"napi_get_cb_info failed".as_ptr());
    return ptr::null_mut();
  }
  if argc < 2 {
    napi_throw_type_error(env, ptr::null(), c"expected 2 arguments".as_ptr());
    return ptr::null_mut();
  }
  // unmarshal arg 0: napi_value → i32
  let mut a: i32 = 0;
  let status = unsafe { napi_get_value_int32(env, args[0], &mut a) };
  match status {
    napi_status::napi_ok => {}
    napi_status::napi_number_expected => {
      napi_throw_type_error(env, ptr::null(), c"arg 0: expected a number".as_ptr());
      return ptr::null_mut();
    }
    _ => {
      napi_throw_error(env, ptr::null(), c"arg 0: i32 conversion failed".as_ptr());
      return ptr::null_mut();
    }
  }
  // unmarshal arg 1: napi_value → i32
  // (the exact same ceremony, match arms and all)
  let mut b: i32 = 0;
  let status = unsafe { napi_get_value_int32(env, args[1], &mut b) };
  match status {
    napi_status::napi_ok => {}
    napi_status::napi_number_expected => {
      napi_throw_type_error(env, ptr::null(), c"arg 1: expected a number".as_ptr());
      return ptr::null_mut();
    }
    _ => {
      napi_throw_error(env, ptr::null(), c"arg 1: i32 conversion failed".as_ptr());
      return ptr::null_mut();
    }
  }
  // finally — the one line of actual logic
  let result = sum(a, b);
  // marshal the return value back: i32 → napi_value
  let mut out: napi_value = ptr::null_mut();
  let status = unsafe { napi_create_int32(env, result, &mut out) };
  if status != napi_status::napi_ok {
    napi_throw_error(env, ptr::null(), c"failed to create return value".as_ptr());
    return ptr::null_mut();
  }
  out
}

// ── registration: runs once, at dlopen time ───────────────
static mut NAPI_MODULE: napi_module = napi_module {
  nm_version: 1,
  nm_flags: 0,
  nm_filename: ptr::null(),
  nm_register_func: Some(register_module),
  nm_modname: c"index".as_ptr() as *const c_char,
  nm_priv: ptr::null_mut(),
  reserved: [ptr::null_mut::<c_void>(); 4],
};

// hand the module descriptor to Node before main() — yes, really
#[used]
#[cfg_attr(target_os = "linux", link_section = ".init_array")]
static REGISTER_MODULE: extern "C" fn() = {
  extern "C" fn init() {
    unsafe { napi_module_register(&raw mut NAPI_MODULE) }
  }
  init
};

unsafe extern "C" fn register_module(env: napi_env, exports: napi_value) -> napi_value {
  let mut sum_fn: napi_value = ptr::null_mut();
  let status = unsafe {
    napi_create_function(
      env, c"sum".as_ptr(), 3,
      Some(sum_js), ptr::null_mut(),
      &mut sum_fn,
    )
  };
  if status != napi_status::napi_ok {
    napi_throw_error(env, ptr::null(), c"napi_create_function failed".as_ptr());
    return ptr::null_mut();
  }
  let status = unsafe { napi_set_named_property(env, exports, c"sum".as_ptr(), sum_fn) };
  if status != napi_status::napi_ok {
    napi_throw_error(env, ptr::null(), c"napi_set_named_property failed".as_ptr());
    return ptr::null_mut();
  }
  exports
}

// …and that was ONE function. now add async, classes, buffers,
// error mapping and per-platform .node loading — per function.`;

const RAW_LINES = RAW_CODE.split("\n");

/** visible window before the fold marker (napi.md: ~40 visible lines) */
export const RAW_VISIBLE_COUNT = 40;
export const RAW_VISIBLE = RAW_LINES.slice(0, RAW_VISIBLE_COUNT).join("\n");
/** the 78 lines behind `// … 78 more lines` */
export const RAW_FOLD = RAW_LINES.slice(RAW_VISIBLE_COUNT).join("\n");
export const RAW_FOLD_COUNT = RAW_LINES.length - RAW_VISIBLE_COUNT;
export const RAW_TOTAL = RAW_LINES.length;

/** the whole point — napi.md §N2 AFTER */
export const AFTER_CODE = `#[napi]
fn sum(a: i32, b: i32) -> i32 {
  a + b
}`;

/** lines of glue eliminated = 118 raw − 4 macro */
export const GLUE_ELIMINATED = RAW_TOTAL - 4;
